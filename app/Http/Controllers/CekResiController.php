<?php

namespace App\Http\Controllers;

use App\Services\ResiTracker;
use Illuminate\Http\Request;

class CekResiController extends Controller
{
    public function __construct(
        protected ResiTracker $binderbyte
    ) {}

    public function track(Request $request)
    {
        $request->validate([
            'awb' => 'required|string',
            'courier' => 'required|string',
            'number' => 'nullable|string',
        ]);

        return response()->json(
            $this->binderbyte->track(
                $request->awb,
                $request->courier,
                $request->number
            )
        );
    }
}
