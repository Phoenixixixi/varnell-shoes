<?php

namespace App\Http\Controllers;

use App\Models\ConsumentCare;
use Inertia\Inertia;

class Consument extends Controller
{
    public function index()
    {
        $consument_care = ConsumentCare::with('user')
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('consument-care', [
            'consument' => $consument_care,
        ]);
    }
}
