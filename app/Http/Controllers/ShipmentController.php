<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Models\Payment;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ShipmentController extends Controller
{
    public function userIndex()
    {
        $user = auth()->user();
        $shipments = Shipment::whereHas('order', function($query) use ($user) {
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
            'midtrans_client_key' => config('services.midtrans.client_key'),
            'is_production' => config('services.midtrans.is_production')
        ]);
    }

    public function index()
    {
        $shipments = Shipment::with(['order.user', 'order.payment'])->latest()->get();

        $stats = [
            'pending' => Shipment::where('status', 'pending')->count(),
            'progress' => Shipment::where('status', 'sent_to_courier')->count(),
            'packaging' => Shipment::where('status', 'packaging')->count(),
            'completed' => Shipment::where('status', 'completed')->count(),
        ];

        // Add tracking details for each shipment that has a tracking number
        foreach ($shipments as $shipment) {
            if ($shipment->tracking_number && $shipment->courier) {
                $shipment->tracking_details = $this->getTrackingDetails($shipment->tracking_number, $shipment->courier);
            }
        }

        return Inertia::render('shipment', [
            'shipments' => $shipments,
            'stats' => $stats,
        ]);
    }

    public function status(Request $request)
    {
        $orderId = $request->order_id;

        if (!$orderId && auth()->check()) {
            $latestShipment = Shipment::whereHas('order', function($query) {
                $query->where('user_id', auth()->id());
            })->latest()->first();

            if ($latestShipment) {
                $orderId = $latestShipment->order_id;
            }
        }

        if (!$orderId) {
            return redirect()->route('landing-page')->with('error', 'Please provide an order ID to track.');
        }

        $payment = Payment::where('order_id', $orderId)->first();


        $shipment = Shipment::where('order_id', $orderId)
            ->with(['order.items.product.images', 'order.user'])
            ->firstOrFail();

        // Get tracking details from external API if tracking number exists
        if ($shipment->tracking_number && $shipment->courier) {
            $shipment->tracking_details = $this->getTrackingDetails($shipment->tracking_number, $shipment->courier);
        }

        $shipment['status_payment'] = $payment['status'] ?? 'pending';

        return Inertia::render('user/shipment-status', [
            'shipment' => $shipment,
            'midtrans_client_key' => config('services.midtrans.client_key'),
            'is_production' => config('services.midtrans.is_production')
        ]);
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
            if (!$shipment->order->payment || $shipment->order->payment->status !== 'success') {
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
        
        if (!$apiKey) {
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
                'awb'     => $trackingNumber,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['status']) && $data['status'] == 200) {
                    $result = $data['data'];
                    
                    return [
                        'status' => $result['summary']['status'] ?? 'Unknown',
                        'position' => $result['summary']['last_location'] ?? 'Unknown',
                        'last_updated' => $result['summary']['date'] ?? now()->format('Y-m-d H:i:s'),
                        'history' => array_map(function($item) {
                            return [
                                'time' => $item['date'],
                                'location' => $item['location'] ?? 'Facility',
                                'description' => $item['desc']
                            ];
                        }, $result['history'] ?? [])
                    ];
                }
            }
            
            Log::error('Binderbyte API Error: ' . $response->body());
            return null;
        } catch (\Exception $e) {
            Log::error('Binderbyte API Exception: ' . $e->getMessage());
            return null;
        }
    }
}
