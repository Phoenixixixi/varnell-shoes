<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MaterialLog;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;

class MaterialLogs extends Controller
{
    public function index(Request $request)
    {
        $logs = MaterialLog::with(['material', 'user'])
            ->orderBy('updated_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('material-log', [
            'logs' => $logs,
        ]);
    }

    /**
     * Export material usage logs to Excel (.xlsx).
     * Filters by updated_at so timezone skew doesn't exclude recent records.
     */
    public function export(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
        ]);

        $startDate = $validated['start_date'];
        $endDate   = $validated['end_date'];

        $logs = MaterialLog::with(['material', 'user'])
            ->whereBetween('updated_at', [
                $startDate . ' 00:00:00',
                $endDate   . ' 23:59:59',
            ])
            ->orderBy('updated_at', 'asc')
            ->get();

        // ── Build spreadsheet ────────────────────────────────────────────────
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Material Logs');

        // ── Title block ──────────────────────────────────────────────────────
        $sheet->mergeCells('A1:F1');
        $sheet->setCellValue('A1', 'Material Usage History Report');
        $sheet->getStyle('A1')->applyFromArray([
            'font'      => ['bold' => true, 'size' => 14, 'color' => ['argb' => 'FFFFFFFF']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF3B4A6B']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(28);

        $sheet->mergeCells('A2:F2');
        $sheet->setCellValue('A2', "Period: {$startDate} to {$endDate}    |    Generated: " . now()->format('Y-m-d H:i:s'));
        $sheet->getStyle('A2')->applyFromArray([
            'font'      => ['italic' => true, 'size' => 10, 'color' => ['argb' => 'FF64748B']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        // ── Column headers ───────────────────────────────────────────────────
        $headers = ['#', 'Material Name', 'Action By', 'Type', 'Quantity', 'Notes', 'Date & Time'];
        $headerRow = 4;
        $cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

        // Extend merge to G for 7 columns
        $sheet->mergeCells('A1:G1');
        $sheet->mergeCells('A2:G2');

        foreach ($cols as $i => $col) {
            $sheet->setCellValue($col . $headerRow, $headers[$i]);
        }
        $sheet->getStyle("A{$headerRow}:G{$headerRow}")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF4F46E5']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FF6366F1']]],
        ]);
        $sheet->getRowDimension($headerRow)->setRowHeight(22);

        // ── Data rows ────────────────────────────────────────────────────────
        $row = $headerRow + 1;
        $no  = 1;
        foreach ($logs as $log) {
            $isEven = ($no % 2 === 0);
            $bgColor = $isEven ? 'FFF1F5F9' : 'FFFFFFFF';

            $typeColor = match (strtolower($log->type)) {
                'in'         => 'FF16A34A',
                'out'        => 'FFDC2626',
                'adjustment' => 'FFD97706',
                default      => 'FF6B7280',
            };

            $sheet->setCellValue("A{$row}", $no);
            $sheet->setCellValue("B{$row}", $log->material_name ?: ($log->material?->name ?? 'Unknown'));
            $sheet->setCellValue("C{$row}", $log->user?->name ?? 'System');
            $sheet->setCellValue("D{$row}", strtoupper($log->type));
            $sheet->setCellValue("E{$row}", ($log->type === 'in' ? '+' : '-') . $log->quantity);
            $sheet->setCellValue("F{$row}", $log->description ?? '-');
            $sheet->setCellValue("G{$row}", $log->updated_at?->format('Y-m-d H:i:s') ?? '-');

            // Row background
            $sheet->getStyle("A{$row}:G{$row}")->applyFromArray([
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $bgColor]],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFE2E8F0']]],
            ]);

            // Type column colour
            $sheet->getStyle("D{$row}")->applyFromArray([
                'font'      => ['bold' => true, 'color' => ['argb' => $typeColor]],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);

            // Quantity center
            $sheet->getStyle("E{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("A{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $row++;
            $no++;
        }

        // ── Column widths ────────────────────────────────────────────────────
        $sheet->getColumnDimension('A')->setWidth(6);
        $sheet->getColumnDimension('B')->setWidth(24);
        $sheet->getColumnDimension('C')->setWidth(18);
        $sheet->getColumnDimension('D')->setWidth(14);
        $sheet->getColumnDimension('E')->setWidth(12);
        $sheet->getColumnDimension('F')->setWidth(36);
        $sheet->getColumnDimension('G')->setWidth(22);

        // ── Stream response ──────────────────────────────────────────────────
        $filename = "material_logs_{$startDate}_to_{$endDate}.xlsx";

        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $filename, [
            'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control'       => 'max-age=0',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
