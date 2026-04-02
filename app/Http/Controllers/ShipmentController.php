<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShipmentController extends Controller
{
    public function index()
    {
        $shipments = Shipment::with(['order.user'])->latest()->get();

        $stats = [
            'pending' => Shipment::where('status', 'pending')->count(),
            'progress' => Shipment::where('status', 'progress')->count(),
            'packaging' => Shipment::where('status', 'packaging')->count(),
            'completed' => Shipment::where('status', 'completed')->count(),
        ];

        return Inertia::render('shipment', [
            'shipments' => $shipments,
            'stats' => $stats,
        ]);
    }
}
