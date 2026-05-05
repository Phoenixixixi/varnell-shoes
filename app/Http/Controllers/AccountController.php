<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user()->load(['address', 'orders.items.product']);
        
        return Inertia::render('user/account', [
            'user' => $user
        ]);
    }
}
