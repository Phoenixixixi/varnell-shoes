<?php

namespace App\Http\Controllers;

use App\Models\ProductLogs;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductLogController extends Controller
{
    /**
     * Display a listing of the product logs.
     */
    public function index()
    {
        $logs = ProductLogs::with(['product', 'user'])
            ->latest()
            ->get();

        return Inertia::render('product-logs', [
            'logs' => $logs,
        ]);
    }

    /**
     * Export product stock logs to CSV/Excel.
     */
    public function export(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $startDate = $validated['start_date'];
        $endDate = $validated['end_date'];

        $logs = ProductLogs::with(['product', 'user'])
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->latest()
            ->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"product_logs_{$startDate}_to_{$endDate}.csv\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0'
        ];

        $callback = function() use ($startDate, $endDate, $logs) {
            $file = fopen('php://output', 'w');

            fputcsv($file, ['Product Stock History Report']);
            fputcsv($file, ['Period:', "{$startDate} to {$endDate}"]);
            fputcsv($file, ['Generated At:', now()->toDateTimeString()]);
            fputcsv($file, []);

            fputcsv($file, ['Product', 'Action By', 'Type', 'Quantity', 'Notes', 'Date & Time']);

            foreach ($logs as $log) {
                fputcsv($file, [
                    $log->product ? $log->product->name : 'Unknown Product',
                    $log->user ? $log->user->name : 'System',
                    $log->type === 'in' ? 'STOCKED IN' : ($log->type === 'destroy' ? 'DESTROYED' : 'STOCKED OUT'),
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
