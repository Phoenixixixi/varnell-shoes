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
        $stockIn7d  = MaterialLog::where('type', 'in')->where('created_at', '>=', $sevenDaysAgo)->sum('quantity');
        $stockOut7d = MaterialLog::where('type', 'out')->where('created_at', '>=', $sevenDaysAgo)->sum('quantity');

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
        // We send raw per-material monthly data so the frontend can slice it
        // by item and/or month without extra round-trips.
        $rawLogs = MaterialLog::whereIn('type', ['in', 'out'])
            ->where('created_at', '>=', $twelveMonthsAgo)
            ->select('material_id', 'material_name', 'type', 'quantity', 'created_at')
            ->get();

        // Build structure:
        // perMaterial[material_id][YYYY-MM] = { stockIn, stockOut }
        $perMaterial = [];
        $globalMonthMap = [];

        foreach ($rawLogs as $log) {
            $key = Carbon::parse($log->created_at)->format('Y-m');
            $mid = $log->material_id ?? 0;

            // global monthly totals
            if (!isset($globalMonthMap[$key])) {
                $globalMonthMap[$key] = ['stockIn' => 0, 'stockOut' => 0];
            }
            // per-material monthly totals
            if (!isset($perMaterial[$mid])) {
                $perMaterial[$mid] = [];
            }
            if (!isset($perMaterial[$mid][$key])) {
                $perMaterial[$mid][$key] = ['stockIn' => 0, 'stockOut' => 0];
            }

            if ($log->type === 'in') {
                $globalMonthMap[$key]['stockIn']      += (float) $log->quantity;
                $perMaterial[$mid][$key]['stockIn']   += (float) $log->quantity;
            } else {
                $globalMonthMap[$key]['stockOut']     += (float) $log->quantity;
                $perMaterial[$mid][$key]['stockOut']  += (float) $log->quantity;
            }
        }

        // Ensure all 12 months exist in the global map
        for ($i = 11; $i >= 0; $i--) {
            $key = $now->copy()->subMonths($i)->format('Y-m');
            if (!isset($globalMonthMap[$key])) {
                $globalMonthMap[$key] = ['stockIn' => 0, 'stockOut' => 0];
            }
        }
        ksort($globalMonthMap);

        // Shape global monthly for the frontend (includes year-month key for filtering)
        $monthlyTransactions = array_values(array_map(function ($key, $values) {
            return [
                'yearMonth' => $key,                                          // 'YYYY-MM' — used for month filter
                'month'     => Carbon::createFromFormat('Y-m', $key)->format('M Y'),
                'stockIn'   => $values['stockIn'],
                'stockOut'  => $values['stockOut'],
            ];
        }, array_keys($globalMonthMap), array_values($globalMonthMap)));

        // Shape per-material data: array of { materialId, yearMonth, stockIn, stockOut }
        // Frontend will filter + aggregate this based on selected item/month.
        $perMaterialLogs = [];
        foreach ($perMaterial as $mid => $months) {
            foreach ($months as $ym => $vals) {
                $perMaterialLogs[] = [
                    'materialId' => $mid,
                    'yearMonth'  => $ym,
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
            'monthlyTransactions' => $monthlyTransactions,
            'sevenDayFlow'        => $sevenDayFlow,
            'materials'           => $materials,
            'perMaterialLogs'     => $perMaterialLogs,
        ]);
    }
}
