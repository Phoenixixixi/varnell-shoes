<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    /**
     * Display a listing of payments/orders.
     */
    public function index()
    {
        $orders = Order::with(['user', 'payment', 'items.product'])
            ->latest()
            ->get();

        $stats = [
            'total_revenue' => Order::where('status', 'completed')->sum('total_price'),
            'pending_payments' => Order::where('status', 'pending')->count(),
            'total_orders' => Order::count(),
        ];

        return Inertia::render('payments', [
            'orders' => $orders,
            'stats' => $stats,
        ]);
    }
}
