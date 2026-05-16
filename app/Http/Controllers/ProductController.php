<?php

namespace App\Http\Controllers;

use App\Models\Material;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductLogs;
use App\Models\Recipe;
use App\Models\SizesModels;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
            'products' => Product::with(['images', 'descriptions', 'sizes', 'recipe.items.material'])->latest()->get(),
            'recipes' => Recipe::with('items.material')->get(),
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
            'recipe_id' => 'nullable|exists:shoe_recipes,id',
        ]);

        $totalStock = array_sum(array_column($validated['sizes'], 'stock'));

        return DB::transaction(function () use ($validated, $totalStock, $request) {
            // Material Validation
            if ($validated['recipe_id'] && $totalStock > 0) {
                $recipe = Recipe::with('items.material')->find($validated['recipe_id']);
                foreach ($recipe->items as $item) {
                    $totalRequired = $item->quantity_required * $totalStock;
                    if ($item->material->current_stock < $totalRequired) {
                        return redirect()->back()->withErrors([
                            'recipe_id' => "Not enough {$item->material->name}. Required: {$totalRequired}{$item->material->unit}, Available: {$item->material->current_stock}{$item->material->unit}. Please add more material."
                        ]);
                    }
                }

                // Deduct Materials
                foreach ($recipe->items as $item) {
                    $totalRequired = $item->quantity_required * $totalStock;
                    $item->material->decrement('current_stock', $totalRequired);
                    
                    $item->material->logs()->create([
                        'user_id' => auth()->id(),
                        'material_name' => $item->material->name,
                        'type' => 'out',
                        'quantity' => $totalRequired,
                        'description' => "Used for product production: {$validated['name']} (Quantity: {$totalStock})",
                    ]);
                }
            }

            $product = Product::create([
                'name' => $validated['name'],
                'price' => $validated['price'],
                'stock' => $totalStock,
                'description' => $validated['description'],
                'recipe_id' => $validated['recipe_id'],
            ]);

            foreach ($validated['sizes'] as $sizeEntry) {
                $product->sizes()->create([
                    'size' => $sizeEntry['size'],
                    'stock' => $sizeEntry['stock'],
                ]);
            }

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
        });
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
            'recipe_id' => 'nullable|exists:shoe_recipes,id',
        ]);

        $oldStock = $product->stock;
        $totalStock = array_sum(array_column($validated['sizes'], 'stock'));

        return DB::transaction(function () use ($validated, $totalStock, $oldStock, $product, $request) {
            // Handle Material Deduction/Return
            $oldRecipeId = $product->recipe_id;
            $newRecipeId = $validated['recipe_id'];

            if ($oldRecipeId != $newRecipeId) {
                // Return materials for old recipe
                if ($oldRecipeId && $oldStock > 0) {
                    $oldRecipe = Recipe::with('items.material')->find($oldRecipeId);
                    if ($oldRecipe) {
                        foreach ($oldRecipe->items as $item) {
                            $totalReturn = $item->quantity_required * $oldStock;
                            $item->material->increment('current_stock', $totalReturn);
                            
                            $item->material->logs()->create([
                                'user_id' => auth()->id(),
                                'material_name' => $item->material->name,
                                'type' => 'in',
                                'quantity' => $totalReturn,
                                'description' => "Stock returned due to recipe change: {$product->name} (Quantity: {$oldStock})",
                            ]);
                        }
                    }
                }

                // Deduct materials for new recipe
                if ($newRecipeId && $totalStock > 0) {
                    $newRecipe = Recipe::with('items.material')->find($newRecipeId);
                    
                    // Validate first
                    foreach ($newRecipe->items as $item) {
                        $totalRequired = $item->quantity_required * $totalStock;
                        if ($item->material->current_stock < $totalRequired) {
                            return redirect()->back()->withErrors([
                                'recipe_id' => "Not enough {$item->material->name}. Required: {$totalRequired}{$item->material->unit}, Available: {$item->material->current_stock}{$item->material->unit}."
                            ]);
                        }
                    }

                    // Then deduct
                    foreach ($newRecipe->items as $item) {
                        $totalRequired = $item->quantity_required * $totalStock;
                        $item->material->decrement('current_stock', $totalRequired);
                        
                        $item->material->logs()->create([
                            'user_id' => auth()->id(),
                            'material_name' => $item->material->name,
                            'type' => 'out',
                            'quantity' => $totalRequired,
                            'description' => "Used for production (Recipe changed): {$validated['name']} (Quantity: {$totalStock})",
                        ]);
                    }
                }
            } elseif ($newRecipeId && $totalStock != $oldStock) {
                $recipe = Recipe::with('items.material')->find($newRecipeId);
                
                if ($totalStock > $oldStock) {
                    $diff = $totalStock - $oldStock;
                    
                    // Validate
                    foreach ($recipe->items as $item) {
                        $totalRequired = $item->quantity_required * $diff;
                        if ($item->material->current_stock < $totalRequired) {
                            return redirect()->back()->withErrors([
                                'recipe_id' => "Not enough {$item->material->name} for the stock increase. Required: {$totalRequired}{$item->material->unit}, Available: {$item->material->current_stock}{$item->material->unit}."
                            ]);
                        }
                    }

                    // Deduct
                    foreach ($recipe->items as $item) {
                        $totalRequired = $item->quantity_required * $diff;
                        $item->material->decrement('current_stock', $totalRequired);
                        
                        $item->material->logs()->create([
                            'user_id' => auth()->id(),
                            'material_name' => $item->material->name,
                            'type' => 'out',
                            'quantity' => $totalRequired,
                            'description' => "Production stock increase: {$validated['name']} (+{$diff})",
                        ]);
                    }
                } else {
                    $diff = $oldStock - $totalStock;
                    
                    // Return
                    foreach ($recipe->items as $item) {
                        $totalReturn = $item->quantity_required * $diff;
                        $item->material->increment('current_stock', $totalReturn);
                        
                        $item->material->logs()->create([
                            'user_id' => auth()->id(),
                            'material_name' => $item->material->name,
                            'type' => 'in',
                            'quantity' => $totalReturn,
                            'description' => "Stock returned due to stock decrease: {$validated['name']} (-{$diff})",
                        ]);
                    }
                }
            }

            $product->update([
                'name' => $validated['name'],
                'price' => $validated['price'],
                'stock' => $totalStock,
                'description' => $validated['description'],
                'recipe_id' => $validated['recipe_id'],
            ]);

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

            return redirect()->route('admin.product.index')->with('success', 'Product updated successfully.');
        });
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        return DB::transaction(function () use ($product) {
            // Return materials if recipe exists
            if ($product->recipe_id && $product->stock > 0) {
                $recipe = Recipe::with('items.material')->find($product->recipe_id);
                if ($recipe) {
                    foreach ($recipe->items as $item) {
                        $totalReturn = $item->quantity_required * $product->stock;
                        $item->material->increment('current_stock', $totalReturn);
                        
                        $item->material->logs()->create([
                            'user_id' => auth()->id(),
                            'material_name' => $item->material->name,
                            'type' => 'in',
                            'quantity' => $totalReturn,
                            'description' => "Stock returned due to product deletion: {$product->name} (Quantity: {$product->stock})",
                        ]);
                    }
                }
            }

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
        });
    }
}

