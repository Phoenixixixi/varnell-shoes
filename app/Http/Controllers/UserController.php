<?php

namespace App\Http\Controllers;


use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;

class UserController extends Controller
{
    public function index(){
        $products = Product::with(['images' => function($q) {
            $q->orderBy('id')->take(1);
        }, 'sizes'])->latest()->take(3)->get();
        return Inertia::render('user/welcome', [
            'product' => $products
        ]);
    }
}
