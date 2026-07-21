<?php

namespace App\Http\Controllers;

use App\Models\Material;
use App\Models\MaterialLog;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Inertia;

class MaterialDashboardController extends Controller
{
    public function index()
    {
        $now = Carbon::now();
        $sevenDaysAgo = $now->copy()->subDays(7);
        $twelveMonthsAgo = $now->copy()->subMonths(11)->startOfMonth();

        // ── Basic KPIs ──────────────────────────────────────────────────────
        $totalSKUs    = Material::count();
        $totalStock   = Material::sum('current_stock');
        $systemUsers  = User::count();
        $lowStockItems = Material::where('current_stock', '<', 5)->count();

        // ── 7-day flow (global) ─────────────────────────────────────────────
        // Use updated_at (set by the DB server clock) instead of created_at
        // to avoid timezone skew between the app (UTC) and the DB server.
        $stockIn7d  = MaterialLog::where('type', 'in')->where('updated_at', '>=', $sevenDaysAgo)->sum('quantity');
        $stockOut7d = MaterialLog::where('type', 'out')->where('updated_at', '>=', $sevenDaysAgo)->sum('quantity');

        $sevenDayFlow = [
            'stockIn'  => (float) $stockIn7d,
            'stockOut' => (float) $stockOut7d,
        ];

        // ── All materials (for the item filter dropdown) ────────────────────
        $materials = Material::select('id', 'name')->orderBy('name')->get()
            ->map(fn($m) => ['id' => $m->id, 'name' => $m->name])
            ->values()
            ->toArray();

        // ── Raw logs — last 12 months, all materials ────────────────────────
        // Use updated_at for the range filter (DB server clock) and for grouping.
        $rawLogs = MaterialLog::whereIn('type', ['in', 'out'])
            ->where('updated_at', '>=', $twelveMonthsAgo)
            ->select('material_id', 'material_name', 'type', 'quantity', 'updated_at')
            ->get();

        // Build structure:
        // perMaterial[material_id][YYYY-MM-DD] = { stockIn, stockOut }
        $perMaterial = [];
        $globalDailyMap = [];

        foreach ($rawLogs as $log) {
            $key = Carbon::parse($log->updated_at)->format('Y-m-d');
            $mid = $log->material_id ?? 0;

            // global daily totals
            if (!isset($globalDailyMap[$key])) {
                $globalDailyMap[$key] = ['stockIn' => 0, 'stockOut' => 0];
            }
            // per-material daily totals
            if (!isset($perMaterial[$mid])) {
                $perMaterial[$mid] = [];
            }
            if (!isset($perMaterial[$mid][$key])) {
                $perMaterial[$mid][$key] = ['stockIn' => 0, 'stockOut' => 0];
            }

            if ($log->type === 'in') {
                $globalDailyMap[$key]['stockIn']      += (float) $log->quantity;
                $perMaterial[$mid][$key]['stockIn']   += (float) $log->quantity;
            } else {
                $globalDailyMap[$key]['stockOut']     += (float) $log->quantity;
                $perMaterial[$mid][$key]['stockOut']  += (float) $log->quantity;
            }
        }

        // Ensure all days exist in the global map
        $daysIn12Months = $now->copy()->startOfDay()->diffInDays($twelveMonthsAgo->copy()->startOfDay());
        for ($i = 0; $i <= $daysIn12Months; $i++) {
            $key = $twelveMonthsAgo->copy()->addDays($i)->format('Y-m-d');
            if (!isset($globalDailyMap[$key])) {
                $globalDailyMap[$key] = ['stockIn' => 0, 'stockOut' => 0];
            }
        }
        ksort($globalDailyMap);

        // Shape global daily for the frontend
        $dailyTransactions = array_values(array_map(function ($key, $values) {
            return [
                'date'      => $key, // 'YYYY-MM-DD'
                'stockIn'   => $values['stockIn'],
                'stockOut'  => $values['stockOut'],
            ];
        }, array_keys($globalDailyMap), array_values($globalDailyMap)));

        // Shape per-material data: array of { materialId, date, stockIn, stockOut }
        $perMaterialLogs = [];
        foreach ($perMaterial as $mid => $days) {
            foreach ($days as $date => $vals) {
                $perMaterialLogs[] = [
                    'materialId' => $mid,
                    'date'       => $date,
                    'stockIn'    => $vals['stockIn'],
                    'stockOut'   => $vals['stockOut'],
                ];
            }
        }

        return Inertia::render('material-dashboard', [
            'totalSKUs'           => $totalSKUs,
            'totalStock'          => (float) $totalStock,
            'systemUsers'         => $systemUsers,
            'stockIn7d'           => (float) $stockIn7d,
            'stockOut7d'          => (float) $stockOut7d,
            'lowStockItems'       => $lowStockItems,
            'dailyTransactions'   => $dailyTransactions,
            'sevenDayFlow'        => $sevenDayFlow,
            'materials'           => $materials,
            'perMaterialLogs'     => $perMaterialLogs,
        ]);
    }
}
