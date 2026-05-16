<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function __construct()
    {
        \Midtrans\Config::$serverKey = config('services.midtrans.server_key');
        \Midtrans\Config::$isProduction = config('services.midtrans.is_production');
    }

    /**
     * Display a listing of payments/orders.
     */
    public function index()
    {
        $orders = Order::with(['user', 'payment', 'items.product'])
            ->latest()
            ->get();

        $stats = [
            'total_revenue' => Order::whereIn('status', ['processing', 'completed'])->sum('total_price'),
            'pending_payments' => Order::where('status', 'pending')->count(),
            'total_orders' => Order::count(),
        ];

        return Inertia::render('payments', [
            'orders' => $orders,
            'stats' => $stats,
        ]);
    }

    /**
     * Sync payment status from Midtrans API for a specific payment.
     */
    public function sync($id)
    {
        $payment = Payment::findOrFail($id);
        
        try {
            if (!$payment->midtrans_transaction_id) {
                return back()->with('error', 'No transaction ID found to sync.');
            }

            $status = \Midtrans\Transaction::status($payment->midtrans_transaction_id);
            
            $paymentStatus = 'pending';
            if ($status->transaction_status == 'settlement' || $status->transaction_status == 'capture') {
                $paymentStatus = 'success';
            } else if ($status->transaction_status == 'deny' || $status->transaction_status == 'expire' || $status->transaction_status == 'cancel') {
                $paymentStatus = 'failure';
            }

            $payment->update([
                'transaction_status' => $status->transaction_status,
                'status' => $paymentStatus,
                'method' => $status->payment_type,
                'payment_type' => $status->payment_type,
                'payment_time' => $status->settlement_time ?? $status->transaction_time,
            ]);

            if ($paymentStatus == 'success') {
                $payment->order->update(['status' => 'processing']);
            }

            return back()->with('success', 'Payment status synced with Midtrans.');

        } catch (\Exception $e) {
            return back()->with('error', 'Sync failed: ' . $e->getMessage());
        }
    }

    /**
     * Fetch transaction history from Midtrans.
     */
    public function history()
    {
        $serverKey = config('services.midtrans.server_key');
        $isProduction = config('services.midtrans.is_production');
        $baseUrl = $isProduction 
            ? 'https://api.midtrans.com/v2' 
            : 'https://api.sandbox.midtrans.com/v2';

        if (!$serverKey) {
            return response()->json(['error' => 'Midtrans Server Key is not configured.'], 500);
        }

        try {
            $response = Http::withBasicAuth($serverKey, '')
                ->withHeaders([
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ])
                ->get($baseUrl . '/transactions', [
                    'page' => 1,
                    'per_page' => 50,
                ]);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json([
                'error' => 'Midtrans API Error: ' . $response->body(),
                'status' => $response->status()
            ], $response->status() ?: 500);
            
        } catch (\Exception $e) {
            Log::error('Midtrans History Exception: ' . $e->getMessage());
            return response()->json(['error' => 'Connection Error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Reconcile a single transaction from Midtrans with our database.
     */
    public function reconcile(Request $request)
    {
        $midtransId = $request->transaction_id;
        $orderId = $request->order_id;

        try {
            $status = \Midtrans\Transaction::status($midtransId);
            
            $payment = Payment::where('midtrans_transaction_id', $midtransId)->first();
            
            if (!$payment) {
                if (preg_match('/VARNELL-(\d+)/', $orderId, $matches)) {
                    $localOrderId = $matches[1];
                    $order = Order::find($localOrderId);
                    if ($order) {
                        $payment = $order->payment ?: new Payment(['order_id' => $order->id]);
                    }
                }
            }

            if (!$payment) {
                return back()->with('error', 'Could not find a matching order in our database.');
            }

            $paymentStatus = 'pending';
            if ($status->transaction_status == 'settlement' || $status->transaction_status == 'capture') {
                $paymentStatus = 'success';
            } else if ($status->transaction_status == 'deny' || $status->transaction_status == 'expire' || $status->transaction_status == 'cancel') {
                $paymentStatus = 'failure';
            }

            $payment->fill([
                'midtrans_transaction_id' => $status->transaction_id,
                'transaction_status' => $status->transaction_status,
                'status' => $paymentStatus,
                'method' => $status->payment_type,
                'payment_type' => $status->payment_type,
                'payment_time' => $status->settlement_time ?? $status->transaction_time,
            ])->save();

            if ($paymentStatus == 'success') {
                $payment->order->update(['status' => 'processing']);
            }

            return back()->with('success', 'Transaction reconciled successfully.');

        } catch (\Exception $e) {
            return back()->with('error', 'Reconciliation failed: ' . $e->getMessage());
        }
    }
}
