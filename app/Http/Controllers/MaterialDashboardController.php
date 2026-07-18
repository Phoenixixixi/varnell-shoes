<?php

namespace App\Http\Controllers;

use App\Models\Material;
use App\Models\MaterialLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MaterialDashboardController extends Controller
{
    public function index()
    {
        $now = Carbon::now();
        $sevenDaysAgo = $now->copy()->subDays(7);
        $sixMonthsAgo = $now->copy()->subMonths(6)->startOfMonth();

        // Basic KPI counts
        $totalSKUs = Material::count();
        $totalStock = Material::sum('current_stock');
        $systemUsers = User::count();
        $lowStockItems = Material::where('current_stock', '<', 5)->count();

        // 7-day stock flow
        $stockIn7d = MaterialLog::where('type', 'in')
            ->where('created_at', '>=', $sevenDaysAgo)
            ->sum('quantity');

        $stockOut7d = MaterialLog::where('type', 'out')
            ->where('created_at', '>=', $sevenDaysAgo)
            ->sum('quantity');

        $sevenDayFlow = [
            'stockIn' => (float) $stockIn7d,
            'stockOut' => (float) $stockOut7d,
        ];

        // Monthly transactions — last 6 months grouped by month
        $rawLogs = MaterialLog::whereIn('type', ['in', 'out'])
            ->where('created_at', '>=', $sixMonthsAgo)
            ->select('type', 'quantity', 'created_at')
            ->get();

        // Build a map: 'YYYY-MM' => ['stockIn' => x, 'stockOut' => y]
        $monthMap = [];
        foreach ($rawLogs as $log) {
            $key = Carbon::parse($log->created_at)->format('Y-m');
            if (!isset($monthMap[$key])) {
                $monthMap[$key] = ['stockIn' => 0, 'stockOut' => 0];
            }
            if ($log->type === 'in') {
                $monthMap[$key]['stockIn'] += (float) $log->quantity;
            } else {
                $monthMap[$key]['stockOut'] += (float) $log->quantity;
            }
        }

        // Ensure all 6 months are represented (even if no data)
        for ($i = 5; $i >= 0; $i--) {
            $key = $now->copy()->subMonths($i)->format('Y-m');
            if (!isset($monthMap[$key])) {
                $monthMap[$key] = ['stockIn' => 0, 'stockOut' => 0];
            }
        }

        // Sort by month ascending and shape into the expected format
        ksort($monthMap);
        $monthlyTransactions = array_map(function ($key, $values) {
            return [
                'month' => Carbon::createFromFormat('Y-m', $key)->format('M'),
                'stockIn' => $values['stockIn'],
                'stockOut' => $values['stockOut'],
            ];
        }, array_keys($monthMap), array_values($monthMap));

        // Re-index to a plain array for JSON serialisation
        $monthlyTransactions = array_values($monthlyTransactions);

        return Inertia::render('material-dashboard', [
            'totalSKUs' => $totalSKUs,
            'totalStock' => (float) $totalStock,
            'systemUsers' => $systemUsers,
            'stockIn7d' => (float) $stockIn7d,
            'stockOut7d' => (float) $stockOut7d,
            'lowStockItems' => $lowStockItems,
            'monthlyTransactions' => $monthlyTransactions,
            'sevenDayFlow' => $sevenDayFlow,
        ]);
    }
}
