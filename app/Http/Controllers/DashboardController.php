<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Shipment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index()
    {
        // Calculate Income Trends (Last 30 days)
        $incomeTrends = Order::where('status', '!=', 'cancelled')
            ->where('created_at', '>=', Carbon::now()->subDays(30))
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_price) as total')
            )
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get();

        // Shipment Status Analytics
        $shipmentStats = [
            'pending' => Shipment::where('status', 'pending')->count(),
            'packaging' => Shipment::where('status', 'packaging')->count(),
            'progress' => Shipment::where('status', 'sent_to_courier')->count(),
            'completed' => Shipment::where('status', 'completed')->count(),
        ];

        // Overall KPIs
        $stats = [
            'total_income' => Order::whereIn('status', ['processing', 'completed'])->sum('total_price'),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'total_shipments' => Shipment::count(),
            'completed_shipments' => Shipment::where('status', 'completed')->count(),
        ];

        return Inertia::render('dashboard', [
            'incomeTrends' => $incomeTrends,
            'shipmentStats' => $shipmentStats,
            'stats' => $stats,
        ]);
    }
}
