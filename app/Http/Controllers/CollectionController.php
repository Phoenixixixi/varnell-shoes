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

    public function show(Product $collection)
    {
        $collection->load(['images', 'sizes', 'descriptions']);

        $relatedProducts = Product::with(['images' => function ($q) {
            $q->orderBy('id')->take(1);
        }, 'sizes'])
            ->where('id', '!=', $collection->id)
            ->inRandomOrder()
            ->take(3)
            ->get();

        return Inertia::render('user/product-detail', [
            'product' => $collection,
            'relatedProducts' => $relatedProducts,
        ]);
    }
}
