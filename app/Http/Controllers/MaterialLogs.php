<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MaterialLog;
use Inertia\Inertia;

class MaterialLogs extends Controller
{
    public function index(){
        $logs = MaterialLog::with(['material', 'user'])->latest()->get();
        return Inertia::render('material-log', [
            'logs' => $logs
        ]);
    }

    /**
     * Export material usage logs to CSV/Excel.
     */
    public function export(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $startDate = $validated['start_date'];
        $endDate = $validated['end_date'];

        $logs = MaterialLog::with(['material', 'user'])
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->latest()
            ->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"material_logs_{$startDate}_to_{$endDate}.csv\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0'
        ];

        $callback = function() use ($startDate, $endDate, $logs) {
            $file = fopen('php://output', 'w');

            fputcsv($file, ['Material Usage History Report']);
            fputcsv($file, ['Period:', "{$startDate} to {$endDate}"]);
            fputcsv($file, ['Generated At:', now()->toDateTimeString()]);
            fputcsv($file, []);

            fputcsv($file, ['Material Name', 'Action By', 'Type', 'Quantity', 'Notes', 'Date & Time']);

            foreach ($logs as $log) {
                fputcsv($file, [
                    $log->material_name ?: ($log->material ? $log->material->name : 'Unknown Material'),
                    $log->user ? $log->user->name : 'System',
                    strtoupper($log->type),
                    $log->quantity,
                    $log->description ?? '-',
                    $log->created_at->toDateTimeString()
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
