<?php

namespace App\Http\Controllers;

use App\Models\Material;
use App\Models\Recipe;
use App\Models\RecipeItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RecipeController extends Controller
{
    public function index()
    {
        return Inertia::render('recipes', [
            'recipes' => Recipe::with('items.material')->latest()->get(),
            'materials' => Material::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:shoe_recipes,name',
            'description' => 'required|string|max:255',
        ]);

        $recipe = Recipe::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
        ]);

        return redirect()
            ->route('admin.recipes.index')
            ->with('success', 'Recipe created successfully.');
    }

    public function update(Request $request, Recipe $recipe)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:shoe_recipes,name,' . $recipe->id,
            'description' => 'required|string|max:255',
        ]);

        $recipe->update($validated);

        return redirect()->route('admin.recipes.index')->with('success', 'Recipe updated successfully.');
    }

    public function destroy(Recipe $recipe)
    {
        $recipe->delete();
        return redirect()->route('admin.recipes.index')->with('success', 'Recipe deleted successfully.');
    }

    public function addItem(Request $request, Recipe $recipe)
    {
        $validated = $request->validate([
            'material_id' => 'required|exists:raw_materials,id',
            'quantity_required' => 'required|numeric|min:0.01',
        ]);

        // Check if item already exists
        $existing = $recipe->items()->where('material_id', $validated['material_id'])->first();
        if ($existing) {
            $existing->update(['quantity_required' => $validated['quantity_required']]);
        } else {
            $recipe->items()->create($validated);
        }

        return redirect()->back()->with('success', 'Item added to recipe.');
    }

    public function removeItem(RecipeItem $item)
    {
        $item->delete();
        return redirect()->back()->with('success', 'Item removed from recipe.');
    }
}

