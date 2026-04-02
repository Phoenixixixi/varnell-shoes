<?php

namespace App\Http\Controllers;


use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;

class CollectionController extends Controller
{
    public function index(Request $request){
        $styles = $request->styles;
        $sizes = $request->sizes;
        $products = Product::with(['images', 'sizes',])
        ->when($sizes, function($q) use ($sizes){
            $q->whereHas('sizes', function($q) use ($sizes){
                $q->whereIn('size', $sizes);
            });
        })
        ->latest()
        ->paginate(4);
        return Inertia::render('user/collections', [
            'products' => $products,
            'sizesshoes' => $sizes,
            'styleshoes' => $styles
        ]);
    }
}
