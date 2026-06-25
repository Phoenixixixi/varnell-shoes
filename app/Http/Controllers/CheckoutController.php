<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductLogs;
use App\Models\Shipment;
use App\Models\SizesModels;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        if (! $user) {
            return redirect()->route('user.login');
        }

        $items = [];
        $total = 0;

        // Case 1: Buy It Now (Single Product)
        if ($request->has('product_id')) {
            $product = Product::with('images')->findOrFail($request->product_id);
            $size = $request->size;
            $items[] = [
                'product_id' => $product->id,
                'name' => $product->name,
                'price' => $product->price,
                'quantity' => 1,
                'size' => $size,
                'image' => $product->images[0]->image_list ?? null,
            ];
            $total = $product->price;
        }
        // Case 2: Checkout from Cart
        else {
            $cart = Cart::where('user_id', $user->id)->with('items.product.images')->first();
            if (! $cart || $cart->items->isEmpty()) {
                return redirect()->route('cart.index')->with('error', 'Your cart is empty.');
            }

            foreach ($cart->items as $item) {
                $items[] = [
                    'product_id' => $item->product_id,
                    'name' => $item->product->name,
                    'price' => $item->product->price,
                    'quantity' => $item->quantity,
                    'size' => $item->size,
                    'image' => $item->product->images[0]->image_list ?? null,
                ];
                $total += $item->product->price * $item->quantity;
            }
        }

        return Inertia::render('user/checkout', [
            'items' => $items,
            'total' => $total,
            'user' => $user,
        ]);
    }

    // -------------------------------------------------------------------------
    // Doku Non-SNAP Helpers
    // -------------------------------------------------------------------------

    /**
     * Sanitize string to only allowed characters by Doku Non-SNAP API.
     */
    private function sanitizeDokuString(string $value): string
    {
        return preg_replace('/[^a-zA-Z0-9.\-\/+,=_:\'@% ]/', '', $value);
    }

    /**
     * Build Doku Non-SNAP HMAC-SHA256 signature.
     *
     * stringToSign format:
     *   Client-Id:{clientId}\n
     *   Request-Id:{requestId}\n
     *   Request-Timestamp:{timestamp}\n
     *   Request-Target:{endpointPath}\n
     *   Digest:{digest}          ← only included if body is non-empty
     *
     * Signature = "HMACSHA256=" + base64(hmac-sha256(stringToSign, secretKey))
     */
    private function buildDokuNonSnapSignature(
        string $endpointPath,
        string $requestId,
        string $timestamp,
        string $bodyJson = ''
    ): string {
        $clientId = config('services.doku.client_id');
        $secretKey = config('services.doku.secret_key');

        $stringToSign = "Client-Id:{$clientId}\n"
            ."Request-Id:{$requestId}\n"
            ."Request-Timestamp:{$timestamp}\n"
            ."Request-Target:{$endpointPath}";

        if ($bodyJson !== '') {
            $digest = base64_encode(hash('sha256', $bodyJson, true));
            $stringToSign .= "\nDigest:{$digest}";
        }

        return 'HMACSHA256='.base64_encode(hash_hmac('sha256', $stringToSign, $secretKey, true));
    }

    /**
     * Call Doku Non-SNAP Checkout API to create a payment session.
     * Returns the payment redirect URL.
     */
    private function callDokuCheckout(array $payload): string
    {
        $clientId = config('services.doku.client_id');
        $isProduction = config('services.doku.is_production');
        $baseUrl = $isProduction ? 'https://api.doku.com' : 'https://api-sandbox.doku.com';
        $endpointPath = '/checkout/v1/payment';

        $timestamp = gmdate('Y-m-d\TH:i:s\Z');
        $requestId = (string) Str::uuid();
        $bodyJson = json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        $signature = $this->buildDokuNonSnapSignature($endpointPath, $requestId, $timestamp, $bodyJson);

        \Log::debug('Doku Non-SNAP Checkout Request', [
            'endpoint' => $endpointPath,
            'timestamp' => $timestamp,
            'requestId' => $requestId,
            'signature' => $signature,
            'payload' => $payload,
        ]);

        $response = Http::withHeaders([
            'Client-Id' => $clientId,
            'Request-Id' => $requestId,
            'Request-Timestamp' => $timestamp,
            'Signature' => $signature,
            'Content-Type' => 'application/json',
        ])->withBody($bodyJson, 'application/json')
            ->post($baseUrl.$endpointPath);

        if (! $response->successful()) {
            \Log::error('Doku Checkout Error', ['response' => $response->body()]);
            throw new \Exception('Doku Checkout Error: '.$response->body());
        }

        $json = $response->json();

        return $json['payment']['url']
            ?? $json['response']['payment']['url']
            ?? $json['redirectUrl']
            ?? throw new \Exception('No payment URL returned: '.json_encode($json));
    }

    /**
     * Call Doku Non-SNAP Order Status API to check a payment status.
     * Returns the raw JSON response array.
     */
    private function callDokuOrderStatus(string $invoiceNumber): array
    {
        $clientId = config('services.doku.client_id');
        $isProduction = config('services.doku.is_production');
        $baseUrl = $isProduction ? 'https://api.doku.com' : 'https://api-sandbox.doku.com';
        $endpointPath = '/orders/v1/status/'.$invoiceNumber;

        $timestamp = gmdate('Y-m-d\TH:i:s\Z');
        $requestId = (string) Str::uuid();

        // GET request: no body, so no Digest line in stringToSign
        $signature = $this->buildDokuNonSnapSignature($endpointPath, $requestId, $timestamp);

        \Log::debug('Doku Non-SNAP Order Status Request', [
            'endpoint' => $endpointPath,
            'timestamp' => $timestamp,
            'requestId' => $requestId,
        ]);

        $response = Http::withHeaders([
            'Client-Id' => $clientId,
            'Request-Id' => $requestId,
            'Request-Timestamp' => $timestamp,
            'Signature' => $signature,
        ])->get($baseUrl.$endpointPath);

        if (! $response->successful()) {
            throw new \Exception('Doku Order Status Error: '.$response->body());
        }

        return $response->json();
    }

    // -------------------------------------------------------------------------
    // Controller Actions
    // -------------------------------------------------------------------------

    public function process(Request $request)
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json(['error' => 'Your session has expired. Please login again.'], 401);
        }

        $items = $request->items;
        $total = $request->total;

        try {
            DB::beginTransaction();

            // Create Order
            $order = Order::create([
                'user_id' => $user->id,
                'total_price' => $total,
                'status' => 'pending',
                'shippind_address' => $request->address ?? $user->address,
            ]);

            foreach ($items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'price' => $item['price'],
                    'quantity' => $item['quantity'],
                    'size' => $item['size'],
                ]);
            }

            $dokuItems = [];
            foreach ($items as $item) {
                $dokuItems[] = [
                    'name' => $this->sanitizeDokuString(
                        substr($item['name'].' Size '.$item['size'], 0, 40)
                    ),
                    'price' => (int) $item['price'],
                    'quantity' => (int) $item['quantity'],
                ];
            }

            $invoiceNumber = 'VARNELL-'.$order->id;

            $phone = preg_replace('/[^0-9]/', '', $request->address['phone'] ?? $user->phone ?? '08123456789');

            $payload = [
                'order' => [
                    'invoice_number' => $invoiceNumber,
                    'amount' => (int) $total,
                    'currency' => 'IDR',
                    'callback_url' => route('checkout.callback'),
                    'callback_url_result' => route('shipment.status', ['order_id' => $order->id]),
                    'callback_url_cancel' => route('shipment.index'),
                    'auto_redirect' => true,
                    'line_items' => $dokuItems,
                ],
                'customer' => [
                    'first_name' => $this->sanitizeDokuString($user->name),
                    'email' => $user->email,
                    'phone' => $phone,
                ],
                'payment' => [
                    'payment_due_date' => 60,
                ],
            ];

            $paymentUrl = $this->callDokuCheckout($payload);

            // Create Payment record
            Payment::create([
                'order_id' => $order->id,
                'snap_token' => $paymentUrl,
                'midtrans_order_id' => $invoiceNumber,
                'transaction_status' => 'pending',
                'gross_amout' => $total,
            ]);

            // Create Shipment record early
            Shipment::create([
                'order_id' => $order->id,
                'status' => 'pending',
            ]);

            DB::commit();

            return response()->json([
                'payment_url' => $paymentUrl,
                'order_id' => $order->id,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Checkout Process Error: '.$e->getMessage());

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Finalize payment — polls Doku Non-SNAP Order Status API as fallback/sync.
     * Called from the frontend after user returns from the payment page.
     */
    public function finalize(Request $request)
    {
        $orderId = $request->order_id;

        \Log::info('Checkout Finalize called', ['order_id' => $orderId]);

        $order = Order::with(['items.product', 'payment'])->find($orderId);
        if (! $order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        $payment = $order->payment;
        if (! $payment) {
            return response()->json(['error' => 'Payment record not found'], 404);
        }

        // If already finalized by webhook, return current status immediately
        if (in_array($order->status, ['processing', 'completed'])) {
            return response()->json(['status' => 'ok', 'payment_status' => $payment->status]);
        }

        try {
            $invoiceNumber = $payment->midtrans_order_id;
            $statusData = $this->callDokuOrderStatus($invoiceNumber);

            \Log::debug('Doku Order Status Response', $statusData);

            $latestStatus = $statusData['transaction']['status']
                ?? $statusData['latestTransactionStatus']
                ?? $statusData['order']['status']
                ?? 'pending';

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
                'method' => $statusData['paymentChannel'] ?? $statusData['payment']['payment_channel'] ?? $payment->method ?? 'Doku',
                'midtrans_transaction_id' => $statusData['transactionId'] ?? $statusData['originalReferenceNo'] ?? null,
                'payment_type' => $statusData['paymentChannel'] ?? $statusData['payment']['payment_channel'] ?? $payment->payment_type ?? 'Doku',
                'payment_time' => now(),
            ]);

            if ($paymentStatus === 'success') {
                $this->finalizePayment($order);
            } elseif ($paymentStatus === 'failure') {
                $order->update(['status' => 'cancelled']);
            }

        } catch (\Exception $e) {
            \Log::error('Finalize Check Status Error: '.$e->getMessage());
        }

        return response()->json(['status' => 'ok', 'payment_status' => $payment->status]);
    }

    /**
     * Webhook callback from Doku Non-SNAP.
     * Doku sends a POST request with the payment notification.
     */
    public function callback(Request $request)
    {
        $rawBody = $request->getContent();

        \Log::info('Doku Non-SNAP Webhook received', [
            'headers' => $request->headers->all(),
            'body' => $rawBody,
        ]);

        try {
            $notificationData = json_decode($rawBody, true);

            $invoiceNumber = $notificationData['order']['invoice_number']
                ?? $notificationData['invoiceNumber']
                ?? $notificationData['invoice_number']
                ?? null;

            $transactionStatus = $notificationData['transaction']['status']
                ?? $notificationData['transactionStatus']
                ?? $notificationData['payment']['transaction_status']
                ?? null;

            $transactionId = $notificationData['transactionId']
                ?? $notificationData['transaction']['id']
                ?? $notificationData['payment']['transaction_id']
                ?? null;

            $paymentChannel = $notificationData['paymentChannel']
                ?? $notificationData['payment']['payment_channel']
                ?? 'Doku';

            if (! $invoiceNumber) {
                \Log::error('Doku Callback: Invoice Number not found in payload.');

                return response()->json(['status' => 'error', 'message' => 'Invoice number not found'], 400);
            }

            // Extract the real order ID from our custom format VARNELL-{id}[-timestamp]
            $parts = explode('-', $invoiceNumber);
            $realOrderId = $parts[1] ?? null;

            if (! $realOrderId) {
                \Log::error('Doku Callback: Could not extract Order ID from '.$invoiceNumber);

                return response()->json(['status' => 'error'], 400);
            }

            $order = Order::with('items.product')->find($realOrderId);
            if (! $order) {
                \Log::error('Doku Callback: Order not found: '.$realOrderId);

                return response()->json(['status' => 'error'], 404);
            }

            $payment = Payment::where('order_id', $order->id)->first();
            if (! $payment) {
                $payment = new Payment(['order_id' => $order->id]);
            }

            $paymentStatus = 'pending';
            $transaction = 'pending';

            if (strtoupper($transactionStatus) === 'SUCCESS') {
                $paymentStatus = 'success';
                $transaction = 'settlement';
            } elseif (in_array(strtoupper($transactionStatus), ['FAILED', 'CANCEL', 'EXPIRED'])) {
                $paymentStatus = 'failure';
                $transaction = 'failed';
            }

            $payment->fill([
                'transaction_status' => $transaction,
                'status' => $paymentStatus,
                'method' => $paymentChannel,
                'midtrans_transaction_id' => $transactionId,
                'payment_type' => $paymentChannel,
                'payment_time' => now(),
                'raw_response' => $rawBody,
                'midtrans_order_id' => $invoiceNumber,
            ])->save();

            if ($paymentStatus === 'success') {
                $this->finalizePayment($order);
            } elseif ($paymentStatus === 'failure') {
                $order->update(['status' => 'cancelled']);
            }

            return response()->json(['status' => 'success']);

        } catch (\Exception $e) {
            \Log::error('Doku Callback Error: '.$e->getMessage());

            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Re-initiate payment for an existing pending order.
     * Used when the user needs to retry payment (e.g., previous session expired).
     */
    public function repay(Order $order)
    {
        $user = Auth::user();
        if (! $user || $order->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($order->status !== 'pending') {
            return response()->json(['error' => 'Only pending orders can be paid.'], 400);
        }

        $order->load(['items.product', 'payment']);

        // Return existing valid payment URL if still active
        if ($order->payment && $order->payment->snap_token
            && ! in_array($order->payment->transaction_status, ['deny', 'expire', 'cancel', 'failed'])
        ) {
            return response()->json([
                'payment_url' => $order->payment->snap_token,
                'order_id' => $order->id,
            ]);
        }

        try {
            $dokuItems = [];
            foreach ($order->items as $item) {
                $dokuItems[] = [
                    'name' => $this->sanitizeDokuString(
                        substr($item->product->name.' Size '.$item->size, 0, 40)
                    ),
                    'price' => (int) $item->price,
                    'quantity' => (int) $item->quantity,
                ];
            }

            // Use a new invoice number if previous attempt was denied/expired/cancelled
            $invoiceNumber = 'VARNELL-'.$order->id;
            if ($order->payment && in_array($order->payment->transaction_status, ['deny', 'expire', 'cancel', 'failed'])) {
                $invoiceNumber = 'VARNELL-'.$order->id.'-'.time();
            }

            $phone = preg_replace('/[^0-9]/', '', $user->phone ?? '08123456789');

            $payload = [
                'order' => [
                    'invoice_number' => $invoiceNumber,
                    'amount' => (int) $order->total_price,
                    'currency' => 'IDR',
                    'callback_url' => route('checkout.callback'),
                    'callback_url_result' => route('shipment.status', ['order_id' => $order->id]),
                    'callback_url_cancel' => route('shipment.index'),
                    'auto_redirect' => true,
                    'line_items' => $dokuItems,
                ],
                'customer' => [
                    'first_name' => $this->sanitizeDokuString($user->name),
                    'email' => $user->email,
                    'phone' => $phone,
                ],
                'payment' => [
                    'payment_due_date' => 60,
                ],
            ];

            $paymentUrl = $this->callDokuCheckout($payload);

            if ($order->payment) {
                $order->payment->update([
                    'snap_token' => $paymentUrl,
                    'midtrans_order_id' => $invoiceNumber,
                    'transaction_status' => 'pending',
                ]);
            } else {
                Payment::create([
                    'order_id' => $order->id,
                    'snap_token' => $paymentUrl,
                    'midtrans_order_id' => $invoiceNumber,
                    'transaction_status' => 'pending',
                    'gross_amout' => $order->total_price,
                ]);
            }

            return response()->json([
                'payment_url' => $paymentUrl,
                'order_id' => $order->id,
            ]);

        } catch (\Exception $e) {
            \Log::error('Repay Process Error for Order #'.$order->id.': '.$e->getMessage());

            return response()->json(['error' => 'Doku Error: '.$e->getMessage()], 500);
        }
    }

    /**
     * Finalize the payment: update order status, decrement stock, and create logs.
     * Protected against double-processing.
     */
    private function finalizePayment(Order $order)
    {
        // Avoid double processing
        if ($order->status === 'processing' || $order->status === 'completed') {
            return;
        }

        $order->update(['status' => 'processing']);

        // Clear User's Cart items upon successful payment
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

            // Create product log for the checkout action
            ProductLogs::create([
                'product_id' => $item->product_id,
                'user_id' => $order->user_id,
                'type' => 'out',
                'quantity' => $item->quantity,
                'description' => "Purchased via Doku. Order ID: {$order->id}. Size: {$item->size}",
            ]);
        }
    }
}
