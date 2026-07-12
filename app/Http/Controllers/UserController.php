<?php

namespace App\Http\Controllers;


use App\Models\Product;
use App\Models\ConsumentCare;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

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

    public function consumentCare(){
        return Inertia::render('user/consument-care');
    }

    public function storeConsumentCare(Request $request)
    {
        $rules = [
            'messages' => 'required|string|min:5|max:5000',
        ];

        if (!Auth::check()) {
            $rules['name'] = 'required|string|max:255';
            $rules['email'] = 'required|email|max:255';
        }

        $validated = $request->validate($rules);

        ConsumentCare::create([
            'user_id' => Auth::check() ? Auth::id() : null,
            'name' => Auth::check() ? Auth::user()->name : $validated['name'],
            'email' => Auth::check() ? Auth::user()->email : $validated['email'],
            'messages' => $validated['messages'],
        ]);

        return back()->with('success', 'Thank you for reaching out. We have received your inquiry.');
    }

    public function heritage(){
        return Inertia::render('user/heritage');
    }
}
