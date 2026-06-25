<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PaymentController extends Controller
{
    /**
     * Build Doku Non-SNAP signature for GET requests (no body).
     */
    private function buildSignature(string $requestId, string $timestamp, string $requestTarget): string
    {
        $clientId = config('services.doku.client_id');
        $secretKey = config('services.doku.secret_key');

        $stringToSign = "Client-Id:{$clientId}\n"
            ."Request-Id:{$requestId}\n"
            ."Request-Timestamp:{$timestamp}\n"
            ."Request-Target:{$requestTarget}";

        return 'HMACSHA256='.base64_encode(hash_hmac('sha256', $stringToSign, $secretKey, true));
    }

    /**
     * Fetch the latest status for a single payment from Doku Non-SNAP API.
     * Returns the parsed status data or null on failure.
     */
    private function fetchDokuOrderStatus(string $invoiceNumber): ?array
    {
        $clientId = config('services.doku.client_id');
        $isProduction = config('services.doku.is_production');
        $baseUrl = $isProduction ? 'https://api.doku.com' : 'https://api-sandbox.doku.com';
        $endpoint = '/orders/v1/status/'.$invoiceNumber;

        $requestId = (string) Str::uuid();
        $timestamp = gmdate('Y-m-d\TH:i:s\Z');
        $signature = $this->buildSignature($requestId, $timestamp, $endpoint);

        $response = Http::withHeaders([
            'Client-Id' => $clientId,
            'Request-Id' => $requestId,
            'Request-Timestamp' => $timestamp,
            'Signature' => $signature,
        ])->get($baseUrl.$endpoint);

        if (! $response->successful()) {
            Log::warning('PaymentController fetchDokuOrderStatus failed', [
                'invoice' => $invoiceNumber,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        }

        return $response->json();
    }

    /**
     * Resolve Doku status string to our internal status values.
     * Returns ['payment_status' => ..., 'transaction' => ...]
     */
    private function resolveDokuStatus(string $rawStatus): array
    {
        $upper = strtoupper($rawStatus);

        if (in_array($upper, ['SUCCESS', 'SUCCESSFUL', 'PAID', '00'])) {
            return ['payment_status' => 'success', 'transaction' => 'settlement'];
        }

        if (in_array($upper, ['FAILED', 'CANCEL', 'EXPIRED', '06'])) {
            return ['payment_status' => 'failure', 'transaction' => 'failed'];
        }

        return ['payment_status' => 'pending', 'transaction' => 'pending'];
    }

    /**
     * Display admin payments page.
     *
     * Auto-syncs all pending payments against Doku before rendering so that
     * the data shown is always up-to-date — no separate reconcile step needed.
     * Only payments that are still 'pending' and created within the last 7 days
     * are synced to avoid unnecessary API calls for old orders.
     */
    public function index()
    {
        Log::info('PaymentController index called');

        // ── Auto-sync pending payments from Doku ──────────────────────────────
        $pendingPayments = Payment::where('transaction_status', 'pending')
            ->whereNotNull('midtrans_order_id')
            ->where('created_at', '>=', now()->subDays(7))
            ->get();

        foreach ($pendingPayments as $payment) {
            try {
                $statusData = $this->fetchDokuOrderStatus($payment->midtrans_order_id);

                Log::info('DOKU Order Status Response', [
                    'order_id' => $payment->midtrans_order_id,
                    'response' => $statusData,
                ]);

                if (! $statusData) {
                    continue;
                }

                $rawStatus = $statusData['transaction']['status']
                    ?? $statusData['latestTransactionStatus']
                    ?? $statusData['order']['status']
                    ?? 'pending';

                $resolved = $this->resolveDokuStatus($rawStatus);

                $payment->update([
                    'transaction_status' => $resolved['transaction'],
                    'status' => $resolved['payment_status'],
                    'method' => $statusData['paymentChannel']
                        ?? $statusData['payment']['payment_channel']
                        ?? $payment->method
                        ?? 'Doku',
                    'payment_type' => $statusData['paymentChannel']
                        ?? $statusData['payment']['payment_channel']
                        ?? $payment->payment_type
                        ?? 'Doku',
                    'midtrans_transaction_id' => $statusData['transactionId']
                        ?? $statusData['originalReferenceNo']
                        ?? $payment->midtrans_transaction_id,
                    'payment_time' => now(),
                ]);

                // Update order status if resolved
                if ($resolved['payment_status'] === 'success') {
                    $payment->order()->update(['status' => 'processing']);
                } elseif ($resolved['payment_status'] === 'failure') {
                    $payment->order()->update(['status' => 'cancelled']);
                }

            } catch (\Exception $e) {
                Log::error('PaymentController auto-sync error for '.$payment->midtrans_order_id.': '.$e->getMessage());
            }
        }
        // ──────────────────────────────────────────────────────────────────────

        $orders = Order::with(['user', 'payment', 'items.product'])
            ->latest()
            ->get()
            ->map(function ($order) {
                if ($order->payment) {
                    $order->payment->doku_status = $order->payment->status ?? 'pending';
                    $order->payment->doku_method = $order->payment->method
                        ?? $order->payment->payment_type
                        ?? 'Doku';
                }

                return $order;
            });

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
     * Manually sync a single payment record from Doku (admin action via sync button).
     */
    public function sync($id)
    {
        $payment = Payment::findOrFail($id);

        if (! $payment->midtrans_order_id) {
            return back()->with('error', 'No invoice number found to sync.');
        }

        try {
            $statusData = $this->fetchDokuOrderStatus($payment->midtrans_order_id);

            if (! $statusData) {
                return back()->with('error', 'Doku returned an error. Check logs for details.');
            }

            $rawStatus = $statusData['transaction']['status']
                ?? $statusData['latestTransactionStatus']
                ?? $statusData['order']['status']
                ?? 'pending';

            $resolved = $this->resolveDokuStatus($rawStatus);

            $payment->update([
                'transaction_status' => $resolved['transaction'],
                'status' => $resolved['payment_status'],
                'method' => $statusData['paymentChannel']
                    ?? $statusData['payment']['payment_channel']
                    ?? $payment->method
                    ?? 'Doku',
                'payment_type' => $statusData['paymentChannel']
                    ?? $statusData['payment']['payment_channel']
                    ?? $payment->payment_type
                    ?? 'Doku',
                'midtrans_transaction_id' => $statusData['transactionId']
                    ?? $statusData['originalReferenceNo']
                    ?? $payment->midtrans_transaction_id,
                'payment_time' => now(),
            ]);

            if ($resolved['payment_status'] === 'success') {
                $payment->order()->update(['status' => 'processing']);
            } elseif ($resolved['payment_status'] === 'failure') {
                $payment->order()->update(['status' => 'cancelled']);
            }

            return back()->with('success', 'Payment synced from Doku: '.strtoupper($resolved['payment_status']));

        } catch (\Exception $e) {
            Log::error('PaymentController sync error: '.$e->getMessage());

            return back()->with('error', 'Sync failed: '.$e->getMessage());
        }
    }
}
