<?php

namespace App\Http\Controllers;

use App\Models\ProductLogs;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductLogController extends Controller
{
    /**
     * Display a listing of the product logs.
     */
    public function index()
    {
        $logs = ProductLogs::with(['product', 'user'])
            ->latest()
            ->get();

        return Inertia::render('product-logs', [
            'logs' => $logs,
        ]);
    }
}
