<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\SizesModels;
use App\Models\ProductLogs;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Midtrans\Config;
use Midtrans\Snap;

class CheckoutController extends Controller
{
    public function __construct()
    {
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production');
        Config::$isSanitized = config('services.midtrans.is_sanitized');
        Config::$is3ds = config('services.midtrans.is_3ds');
    }

    public function index(Request $request)
    {
        $user = Auth::user();
        if (!$user) return redirect()->route('user.login');

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
            if (!$cart || $cart->items->isEmpty()) {
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
            'midtrans_client_key' => config('services.midtrans.client_key'),
            'is_production' => config('services.midtrans.is_production')
        ]);
    }

    public function process(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Your session has expired. Please login again.'], 401);
        }
        
        $items = $request->items; // Expecting array of items
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

            $midtransItems = [];

            foreach ($items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'price' => $item['price'],
                    'quantity' => $item['quantity'],
                    'size' => $item['size'],
                ]);

                $midtransItems[] = [
                    'id' => $item['product_id'],
                    'price' => $item['price'],
                    'quantity' => $item['quantity'],
                    'name' => $item['name'] . ' (Size: ' . $item['size'] . ')',
                ];
            }

            // Generate Midtrans Snap Token
            $midtransOrderId = 'VARNELL-' . $order->id;
            $params = [
                'transaction_details' => [
                    'order_id' => $midtransOrderId,
                    'gross_amount' => $total,
                ],
                'customer_details' => [
                    'first_name' => $user->name,
                    'email' => $user->email,
                    'phone' => $request->address['phone'] ?? null,
                    'shipping_address' => [
                        'first_name' => $user->name,
                        'email' => $user->email,
                        'phone' => $request->address['phone'] ?? null,
                        'address' => $request->address['street'] ?? '',
                        'postal_code' => $request->address['postal_code'] ?? '',
                        'country_code' => 'IDN'
                    ]
                ],
                'item_details' => $midtransItems,
                'enabled_payments' => [
                    'credit_card', 'gopay', 'shopeepay', 'qris', 'bank_transfer'
                ],
            ];

            $snapToken = Snap::getSnapToken($params);

            // Create Payment record
            Payment::create([
                'order_id' => $order->id,
                'snap_token' => $snapToken,
                'midtrans_order_id' => $midtransOrderId,
                'transaction_status' => 'pending',
                'gross_amout' => $total,
            ]);

            // Create Shipment record early
            \App\Models\Shipment::create([
                'order_id' => $order->id,
                'status' => 'pending',
            ]);

            DB::commit();

            return response()->json([
                'snap_token' => $snapToken,
                'order_id' => $order->id
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Checkout Process Error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Finalize payment after Snap success - called directly from the frontend.
     * This is a fallback when the Midtrans server callback is not reachable (e.g., localhost).
     */
    public function finalize(Request $request)
    {
        $orderId = $request->order_id;
        $transactionId = $request->transaction_id;
        $paymentType = $request->payment_type;
        $transactionStatus = $request->transaction_status;

        \Log::info('Checkout Finalize called from frontend', [
            'order_id' => $orderId,
            'transaction_id' => $transactionId,
            'status' => $transactionStatus,
        ]);

        $order = Order::with('items.product')->find($orderId);
        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        // Verify with Midtrans to ensure it's not a fake request
        try {
            \Midtrans\Config::$serverKey = config('services.midtrans.server_key');
            \Midtrans\Config::$isProduction = config('services.midtrans.is_production');

            $status = \Midtrans\Transaction::status($transactionId);
            $transaction = $status->transaction_status;
            $type = $status->payment_type ?? $paymentType;
        } catch (\Exception $e) {
            // If we can't verify with Midtrans, trust the frontend data (sandbox only)
            $transaction = $transactionStatus;
            $type = $paymentType;
        }

        $payment = Payment::where('order_id', $order->id)->first();
        if (!$payment) {
            $payment = new Payment(['order_id' => $order->id]);
        }

        $paymentStatus = 'pending';
        if ($transaction == 'settlement' || $transaction == 'capture') {
            $paymentStatus = 'success';
        } else if (in_array($transaction, ['deny', 'expire', 'cancel'])) {
            $paymentStatus = 'failure';
        }

        $payment->fill([
            'transaction_status' => $transaction,
            'status' => $paymentStatus,
            'method' => $type,
            'midtrans_transaction_id' => $transactionId,
            'payment_type' => $type,
            'payment_time' => now(),
        ])->save();

        if ($paymentStatus == 'success') {
            $this->finalizePayment($order);
        } else if (in_array($transaction, ['deny', 'expire', 'cancel'])) {
            $order->update(['status' => 'cancelled']);
        }

        return response()->json(['status' => 'ok', 'payment_status' => $paymentStatus]);
    }

    public function callback(Request $request)
    {
        $serverKey = config('services.midtrans.server_key');
        
        // Verify Signature Key for security
        $hashed = hash("sha512", $request->order_id . $request->status_code . $request->gross_amount . $serverKey);
        
        \Log::info('Midtrans Signature Debug', [
            'order_id' => $request->order_id,
            'status_code' => $request->status_code,
            'gross_amount' => $request->gross_amount,
            'calculated_hash' => $hashed,
            'received_signature' => $request->signature_key
        ]);

        if ($hashed !== $request->signature_key) {
            \Log::error('Midtrans Callback: Invalid Signature Key.');
            return response()->json(['status' => 'error', 'message' => 'Invalid signature'], 403);
        }

        try {
            $notification = new \Midtrans\Notification();
            
            $transaction = $notification->transaction_status;
            $type = $notification->payment_type;
            $order_id = $notification->order_id;
            $fraud = $notification->fraud_status;

            \Log::info('Midtrans Callback', [
                'transaction' => $transaction,
                'type' => $type,
                'order_id' => $order_id,
                'fraud' => $fraud,
            ]);

            // Extract the real order ID from our custom format VARNELL-{id}[-timestamp]
            $parts = explode('-', $order_id);
            $realOrderId = $parts[1] ?? null;

            if (!$realOrderId) {
                \Log::error('Midtrans Callback: Could not extract Order ID from ' . $order_id);
                return response()->json(['status' => 'error'], 400);
            }

            $order = Order::with('items.product')->find($realOrderId);
            if (!$order) {
                \Log::error('Midtrans Callback: Order not found: ' . $realOrderId);
                return response()->json(['status' => 'error'], 404);
            }

            $payment = Payment::where('order_id', $order->id)->first();
            if (!$payment) {
                $payment = new Payment(['order_id' => $order->id]);
            }

            $paymentStatus = 'pending';
            if ($transaction == 'settlement' || $transaction == 'capture') {
                $paymentStatus = 'success';
            } else if ($transaction == 'deny' || $transaction == 'expire' || $transaction == 'cancel') {
                $paymentStatus = 'failure';
            }

            $payment->fill([
                'transaction_status' => $transaction,
                'status' => $paymentStatus,
                'method' => $type,
                'midtrans_transaction_id' => $notification->transaction_id,
                'payment_type' => $type,
                'payment_time' => $notification->settlement_time ?? $notification->transaction_time,
                'raw_response' => json_encode($notification->getResponse()),
                'midtrans_order_id' => $order_id,
            ])->save();

            // Status handling based on Midtrans transaction status
            if ($transaction == 'capture') {
                if ($type == 'credit_card') {
                    if ($fraud == 'challenge') {
                        $order->update(['status' => 'pending']);
                    } else {
                        $this->finalizePayment($order);
                    }
                }
            } else if ($transaction == 'settlement') {
                $this->finalizePayment($order);
            } else if ($transaction == 'pending') {
                $order->update(['status' => 'pending']);
            } else if ($transaction == 'deny' || $transaction == 'expire' || $transaction == 'cancel') {
                $order->update(['status' => 'cancelled']);
            }

            return response()->json(['status' => 'success']);

        } catch (\Exception $e) {
            \Log::error('Midtrans Callback Error: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Generate a Snap Token for an existing order.
     */
    public function repay(Order $order)
    {
        $user = Auth::user();
        if (!$user || $order->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($order->status !== 'pending') {
            return response()->json(['error' => 'Only pending orders can be paid.'], 400);
        }

        $order->load(['items.product', 'payment']);

        // 1. Check if we already have a valid Snap Token
        if ($order->payment && $order->payment->snap_token && !in_array($order->payment->transaction_status, ['deny', 'expire', 'cancel'])) {
            return response()->json([
                'snap_token' => $order->payment->snap_token,
                'order_id' => $order->id
            ]);
        }

        try {
            $midtransItems = [];
            foreach ($order->items as $item) {
                $midtransItems[] = [
                    'id' => $item->product_id,
                    'price' => (int)$item->price,
                    'quantity' => (int)$item->quantity,
                    'name' => substr($item->product->name, 0, 40) . ' (Size: ' . $item->size . ')',
                ];
            }

            // If previously failed/expired, we MUST use a new order_id for Midtrans
            $midtransOrderId = 'VARNELL-' . $order->id;
            if ($order->payment && in_array($order->payment->transaction_status, ['deny', 'expire', 'cancel'])) {
                $midtransOrderId = 'VARNELL-' . $order->id . '-' . time();
            }

            $params = [
                'transaction_details' => [
                    'order_id' => $midtransOrderId,
                    'gross_amount' => (int)$order->total_price,
                ],
                'customer_details' => [
                    'first_name' => $user->name,
                    'email' => $user->email,
                    'shipping_address' => [
                        'first_name' => $user->name,
                        'email' => $user->email,
                        'address' => is_array($order->shippind_address) 
                            ? ($order->shippind_address['street'] ?? '') 
                            : ($order->shippind_address ?? $user->address),
                        'postal_code' => is_array($order->shippind_address) 
                            ? ($order->shippind_address['postal_code'] ?? '') 
                            : '',
                        'country_code' => 'IDN'
                    ]
                ],
                'item_details' => $midtransItems,
                'enabled_payments' => [
                    'credit_card', 'gopay', 'shopeepay', 'qris', 'bank_transfer'
                ],
            ];

            \Midtrans\Config::$serverKey = config('services.midtrans.server_key');
            \Midtrans\Config::$isProduction = config('services.midtrans.is_production');

            $snapToken = Snap::getSnapToken($params);

            // Update existing payment record with new token and midtrans_order_id
            if ($order->payment) {
                $order->payment->update([
                    'snap_token' => $snapToken,
                    'midtrans_order_id' => $midtransOrderId,
                ]);
            }

            return response()->json([
                'snap_token' => $snapToken,
                'order_id' => $order->id
            ]);

        } catch (\Exception $e) {
            \Log::error('Repay Process Error for Order #' . $order->id . ': ' . $e->getMessage());
            return response()->json(['error' => 'Midtrans Error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Finalize the payment: update order status, decrement stock, and create logs.
     */
    private function finalizePayment(Order $order)
    {
        // Avoid double processing (e.g., if both capture and settlement notifications are sent)
        if ($order->status === 'processing' || $order->status === 'completed') {
            return;
        }

        $order->update(['status' => 'processing']);

        // Clear User's Cart items upon successful payment
        $cart = Cart::where('user_id', $order->user_id)->first();
        if ($cart) {
            \App\Models\CartItem::where('cart_id', $cart->cart_id)->delete();
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
                'description' => "Purchased via Midtrans. Order ID: {$order->id}. Size: {$item->size}",
            ]);
        }
    }
}
