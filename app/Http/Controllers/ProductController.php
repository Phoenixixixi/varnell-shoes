<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductLogs;
use App\Models\SizesModels;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('product', [
            'products' => Product::with(['images', 'descriptions', 'sizes'])->latest()->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'descriptionList' => 'required|array|min:1',
            'descriptionList.*' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'sizes' => 'required|array|min:1',
            'sizes.*.size' => 'required|string|max:50',
            'sizes.*.stock' => 'required|integer|min:0',
            'images' => 'nullable|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Total stock is the sum of all size stocks
        $totalStock = array_sum(array_column($validated['sizes'], 'stock'));

        $product = Product::create([
            'name' => $validated['name'],
            'price' => $validated['price'],
            'stock' => $totalStock,
            'description' => $validated['description'],
        ]);

        // Save sizes
        foreach ($validated['sizes'] as $sizeEntry) {
            $product->sizes()->create([
                'size' => $sizeEntry['size'],
                'stock' => $sizeEntry['stock'],
            ]);
        }

        // Add log
        if ($totalStock > 0) {
            ProductLogs::create([
                'product_id' => $product->id,
                'user_id' => auth()->id(),
                'type' => 'in',
                'quantity' => $totalStock,
            ]);
        }

        foreach ($validated['descriptionList'] as $desc) {
            $product->descriptions()->create([
                'list' => $desc,
            ]);
        }

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('products', 'public');
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_list' => '/storage/' . $path,
                ]);
            }
        }

        return redirect()->route('admin.product.index')->with('success', 'Product created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'descriptionList' => 'required|array|min:1',
            'descriptionList.*' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'sizes' => 'required|array|min:1',
            'sizes.*.size' => 'required|string|max:50',
            'sizes.*.stock' => 'required|integer|min:0',
            'images' => 'nullable|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            'deleted_images' => 'nullable|array',
            'deleted_images.*' => 'integer|exists:product_images,id',
        ]);

        $oldStock = $product->stock;
        $totalStock = array_sum(array_column($validated['sizes'], 'stock'));

        $product->update([
            'name' => $validated['name'],
            'price' => $validated['price'],
            'stock' => $totalStock,
            'description' => $validated['description'],
        ]);

        // Sync sizes
        $product->sizes()->delete();
        foreach ($validated['sizes'] as $sizeEntry) {
            $product->sizes()->create([
                'size' => $sizeEntry['size'],
                'stock' => $sizeEntry['stock'],
            ]);
        }

        if ($oldStock != $totalStock) {
            $diff = abs($totalStock - $oldStock);
            $type = ($totalStock > $oldStock) ? 'in' : 'out';

            ProductLogs::create([
                'product_id' => $product->id,
                'user_id' => auth()->id(),
                'type' => $type,
                'quantity' => $diff,
            ]);
        }

        // Sync descriptions
        $product->descriptions()->delete();
        foreach ($validated['descriptionList'] as $desc) {
            $product->descriptions()->create([
                'list' => $desc,
            ]);
        }

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('products', 'public');
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_list' => '/storage/' . $path,
                ]);
            }
        }

        if ($request->has('deleted_images') && is_array($request->deleted_images)) {
            $imagesToDelete = ProductImage::whereIn('id', $request->deleted_images)->where('product_id', $product->id)->get();
            foreach ($imagesToDelete as $image) {
                $path = str_replace('/storage/', '', $image->image_list);
                Storage::disk('public')->delete($path);
                $image->delete();
            }
        }

        ProductLogs::create([
            'product_id' => $product->id,
            'user_id' => auth()->id(),
            'type' => 'update',
            'quantity' => $totalStock,
        ]);

        return redirect()->route('admin.product.index')->with('success', 'Product updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        // Delete associated image files
        foreach ($product->images as $image) {
            $path = str_replace('/storage/', '', $image->image_list);
            Storage::disk('public')->delete($path);
        }

        ProductLogs::create([
            'product_id' => $product->id,
            'user_id' => auth()->id(),
            'type' => 'destroy',
            'quantity' => $product->stock,
        ]);

        $product->delete();

        return redirect()->route('admin.product.index')->with('success', 'Product deleted successfully.');
    }
}
