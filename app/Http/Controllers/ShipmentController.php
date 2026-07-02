<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\Payment;
use App\Models\ProductLogs;
use App\Models\Shipment;
use App\Models\SizesModels;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ShipmentController extends Controller
{
    public function userIndex()
    {
        $user = auth()->user();
        $shipments = Shipment::whereHas('order', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->with(['order.items.product.images', 'order.payment'])->latest()->get();

        // Add tracking details for each shipment that has a tracking number
        foreach ($shipments as $shipment) {
            if ($shipment->tracking_number && $shipment->courier) {
                $shipment->tracking_details = $this->getTrackingDetails($shipment->tracking_number, $shipment->courier);
            }
        }

        return Inertia::render('user/my-shipments', [
            'shipments' => $shipments,
        ]);
    }

    public function index(Request $request)
    {
        $query = Shipment::with(['order.user', 'order.payment']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('courier')) {
            $query->where('courier', 'like', '%' . $request->courier . '%');
        }

        $shipments = $query->latest()->paginate(10)->withQueryString();

        $stats = [
            'pending' => Shipment::where('status', 'pending')->count(),
            'progress' => Shipment::where('status', 'sent_to_courier')->count(),
            'packaging' => Shipment::where('status', 'packaging')->count(),
            'completed' => Shipment::where('status', 'completed')->count(),
        ];

        // Add tracking details only for the paginated shipments
        foreach ($shipments->items() as $shipment) {
            if ($shipment->tracking_number && $shipment->courier) {
                $shipment->tracking_details = $this->getTrackingDetails($shipment->tracking_number, $shipment->courier);
            }
        }

        return Inertia::render('shipment', [
            'shipments' => $shipments,
            'stats' => $stats,
            'filters' => $request->only(['status', 'courier']),
        ]);
    }

    public function status(Request $request)
    {
        $orderId = $request->order_id;

        if (! $orderId && auth()->check()) {
            $latestShipment = Shipment::whereHas('order', function ($query) {
                $query->where('user_id', auth()->id());
            })->latest()->first();

            if ($latestShipment) {
                $orderId = $latestShipment->order_id;
            }
        }

        if (! $orderId) {
            return redirect()->route('landing-page')->with('error', 'Please provide an order ID to track.');
        }

        $payment = Payment::where('order_id', $orderId)->first();

        // Auto-sync payment status from Doku when user lands on this page after payment.
        // This handles the case where Doku webhook is delayed or hasn't fired yet.
        if ($payment && $payment->midtrans_order_id && in_array($payment->status, [null, 'pending', ''])) {
            $this->syncPaymentFromDoku($payment);
        }

        $shipment = Shipment::where('order_id', $orderId)
            ->with(['order.items.product.images', 'order.user'])
            ->firstOrFail();

        // Get tracking details from external API if tracking number exists
        if ($shipment->tracking_number && $shipment->courier) {
            $shipment->tracking_details = $this->getTrackingDetails($shipment->tracking_number, $shipment->courier);
        }

        // Re-fetch fresh payment status after possible sync
        $payment = Payment::where('order_id', $orderId)->first();
        $shipment['status_payment'] = $payment['status'] ?? 'pending';

        return Inertia::render('user/shipment-status', [
            'shipment' => $shipment,
        ]);
    }

    /**
     * Sync a single payment record against Doku Non-SNAP Order Status API.
     * Updates payment status in DB and triggers order finalization if successful.
     */
    private function syncPaymentFromDoku(Payment $payment): void
    {
        try {
            $clientId = config('services.doku.client_id');
            $secretKey = config('services.doku.secret_key');
            $isProduction = config('services.doku.is_production');
            $baseUrl = $isProduction ? 'https://api.doku.com' : 'https://api-sandbox.doku.com';
            $invoiceNumber = $payment->midtrans_order_id;
            $endpointPath = '/orders/v1/status/'.$invoiceNumber;

            $timestamp = gmdate('Y-m-d\TH:i:s\Z');
            $requestId = (string) Str::uuid();

            // Non-SNAP signature (no body/Digest for GET)
            $stringToSign = "Client-Id:{$clientId}\n"
                ."Request-Id:{$requestId}\n"
                ."Request-Timestamp:{$timestamp}\n"
                ."Request-Target:{$endpointPath}";
            $signature = 'HMACSHA256='.base64_encode(hash_hmac('sha256', $stringToSign, $secretKey, true));

            $response = Http::withHeaders([
                'Client-Id' => $clientId,
                'Request-Id' => $requestId,
                'Request-Timestamp' => $timestamp,
                'Signature' => $signature,
            ])->get($baseUrl.$endpointPath);

            if (! $response->successful()) {
                Log::warning('ShipmentController syncPaymentFromDoku: Doku returned error', [
                    'invoice' => $invoiceNumber,
                    'body' => $response->body(),
                ]);

                return;
            }

            $statusData = $response->json();
            $latestStatus = $statusData['transaction']['status']
                ?? $statusData['latestTransactionStatus']
                ?? $statusData['order']['status']
                ?? 'pending';

            Log::info('ShipmentController syncPaymentFromDoku', [
                'invoice' => $invoiceNumber,
                'status' => $latestStatus,
                'raw' => $statusData,
            ]);

            $payment->update([
                'method' => data_get($statusData, 'channel.id', 'Doku'),
            ]);

            $paymentStatus = 'pending';
            $transaction = 'pending';

            if (in_array(strtoupper($latestStatus), ['SUCCESS', 'SUCCESSFUL', 'PAID', '00'])) {
                $paymentStatus = 'success';
                $transaction = 'settlement';
            } elseif (in_array(strtoupper($latestStatus), ['FAILED', 'CANCEL', 'EXPIRED', '06'])) {
                $paymentStatus = 'failure';
                $transaction = 'failed';
            }

            $payment->update([
                'transaction_status' => $transaction,
                'status' => $paymentStatus,
                'method' => $statusData['paymentChannel']
                    ?? $statusData['payment']['payment_channel']
                    ?? $payment->method
                    ?? 'Doku',
                'midtrans_transaction_id' => $statusData['transactionId']
                    ?? $statusData['originalReferenceNo']
                    ?? $payment->midtrans_transaction_id,
                'payment_type' => $statusData['paymentChannel']
                    ?? $statusData['payment']['payment_channel']
                    ?? $payment->payment_type
                    ?? 'Doku',
                'payment_time' => now(),
            ]);

            $order = Order::with('items.product')->find($payment->order_id);
            if ($order) {
                if ($paymentStatus === 'success') {
                    $this->finalizeOrderPayment($order);
                } elseif ($paymentStatus === 'failure') {
                    $order->update(['status' => 'cancelled']);
                }
            }

        } catch (\Exception $e) {
            Log::error('ShipmentController syncPaymentFromDoku exception: '.$e->getMessage());
        }
    }

    /**
     * Finalize order after confirmed payment:
     * - Update order status to processing
     * - Clear user cart
     * - Decrement stock
     * - Write product logs
     */
    private function finalizeOrderPayment(Order $order): void
    {
        if (in_array($order->status, ['processing', 'completed'])) {
            return; // already finalized, skip
        }

        $order->update(['status' => 'processing']);

        // Clear user's cart
        $cart = Cart::where('user_id', $order->user_id)->first();
        if ($cart) {
            CartItem::where('cart_id', $cart->cart_id)->delete();
        }

        foreach ($order->items as $item) {
            // Decrement size-specific stock
            $sizeRecord = SizesModels::where('product_id', $item->product_id)
                ->where('size', $item->size)
                ->first();
            if ($sizeRecord) {
                $sizeRecord->decrement('stock', $item->quantity);
            }

            // Decrement total product stock
            $item->product->decrement('stock', $item->quantity);

            // Product log
            ProductLogs::create([
                'product_id' => $item->product_id,
                'user_id' => $order->user_id,
                'type' => 'out',
                'quantity' => $item->quantity,
                'description' => "Purchased via Doku. Order ID: {$order->id}. Size: {$item->size}",
            ]);
        }
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:pending,packaging,sent_to_courier,completed',
            'courier' => 'nullable|string',
            'tracking_number' => 'nullable|string',
        ]);

        $shipment = Shipment::with('order.payment')->findOrFail($id);

        // Validation: Cannot move to packaging/sent/completed if payment is not success
        if (in_array($request->status, ['packaging', 'sent_to_courier', 'completed'])) {
            if (! $shipment->order->payment || $shipment->order->payment->status !== 'success') {
                return back()->with('error', 'Cannot process shipment. Payment for this order is not confirmed yet.');
            }
        }

        $shipment->update($request->only(['status', 'courier', 'tracking_number']));

        return back()->with('success', 'Shipment updated successfully.');
    }

    /**
     * Fetch tracking details from Binderbyte API
     */
    private function getTrackingDetails($trackingNumber, $courier)
    {
        $apiKey = env('BINDER_BYTE_API_KEY');

        if (! $apiKey) {
            Log::warning('Binderbyte API key not found in .env');

            return null;
        }

        // Map courier names to Binderbyte codes if necessary
        $courierMap = [
            'jne' => 'jne',
            'j&t' => 'jnt',
            'jnt' => 'jnt',
            'sicepat' => 'sicepat',
            'pos' => 'pos',
            'tiki' => 'tiki',
            'anteraja' => 'anteraja',
            'wahana' => 'wahana',
            'ninja' => 'ninja',
            'lion' => 'lion',
            'pcp' => 'pcp',
            'jet' => 'jet',
            'rex' => 'rex',
            'sap' => 'sap',
            'rpx' => 'rpx',
            'ide' => 'ide',
            'sentral' => 'sentral',
        ];

        $courierCode = strtolower(trim($courier));
        $courierCode = $courierMap[$courierCode] ?? $courierCode;

        try {
            $response = Http::get('https://api.binderbyte.com/v1/track', [
                'api_key' => $apiKey,
                'courier' => $courierCode,
                'awb' => $trackingNumber,
            ]);

            if ($response->successful()) {
                $data = $response->json();

                if (isset($data['status']) && $data['status'] == 200) {
                    $result = $data['data'];

                    return [
                        'status' => $result['summary']['status'] ?? 'Unknown',
                        'position' => $result['summary']['last_location'] ?? 'Unknown',
                        'last_updated' => $result['summary']['date'] ?? now()->format('Y-m-d H:i:s'),
                        'history' => array_map(function ($item) {
                            return [
                                'time' => $item['date'],
                                'location' => $item['location'] ?? 'Facility',
                                'description' => $item['desc'],
                            ];
                        }, $result['history'] ?? []),
                    ];
                }
            }

            Log::error('Binderbyte API Error: '.$response->body());

            return null;
        } catch (\Exception $e) {
            Log::error('Binderbyte API Exception: '.$e->getMessage());

            return null;
        }
    }
}
