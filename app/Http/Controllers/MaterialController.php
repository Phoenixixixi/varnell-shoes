<?php

namespace App\Http\Controllers;

use App\Models\Material;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class MaterialController extends Controller
{
    public function index()
    {
        $materials = Material::latest()->get();
        return Inertia::render('materials', [
            'materials' => $materials
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:raw_materials,name',
            'unit' => 'required|string|max:50',
            'initial_stock' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:255',
            'created_at' => 'nullable|date',
        ]);

        // Use the picked date but keep the real current time; fall back to now() if blank.
        $timestamp = !empty($validated['created_at'])
            ? Carbon::parse($validated['created_at'])->setTimeFrom(now())
            : now();

        DB::transaction(function () use ($validated, $request, $timestamp) {
            $material = Material::create([
                'name' => $validated['name'],
                'unit' => $validated['unit'],
                'current_stock' => $validated['initial_stock'],
                'created_at' => $timestamp,
            ]);

            if ($validated['initial_stock'] > 0) {
                $material->logs()->create([
                    'user_id' => $request->user()->id ?? null,
                    'material_name'=> $validated['name'],
                    'type' => 'in',
                    'quantity' => $validated['initial_stock'],
                    'description' => $validated['description'] ?? 'Initial stock setup',
                    'created_at' => $timestamp,
                ]);
            }
        });

        return redirect()->back()->with('success', 'Material created successfully.');
    }

    public function update(Request $request, Material $material)
    {

        $oldStock = $material->current_stock;
        $oldName = $material->name;
        $oldUnit = $material->unit;

        $validated = $request->validate([
            'name' => 'required|string|max:255|',
            'unit' => 'required|string|max:50',
            'initial_stock' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:255',
            'created_at' => 'nullable|date',
        ]);

        // Use the picked date but keep the real current time; fall back to now() if blank.
        $timestamp = !empty($validated['created_at'])
            ? Carbon::parse($validated['created_at'])->setTimeFrom(now())
            : now();

          DB::transaction(function () use ($validated, $request, $material, $oldStock, $oldName, $oldUnit, $timestamp) {
            $material->update([
                'name' => $validated['name'],
                'unit' => $validated['unit'],
                'current_stock' => $validated['initial_stock'],
                'created_at' => !empty($validated['created_at']) ? $timestamp : $material->created_at,
            ]);

            if ($validated['initial_stock'] > $oldStock) {
                $material->logs()->create([
                    'user_id' => $request->user()->id ?? null,
                    'material_name'=> $validated['name'],
                    'type' => 'in',
                   'quantity' => $validated['initial_stock'] - $oldStock,
                    'description' => $validated['description'] ?? 'Adding Stock',
                    'created_at' => $timestamp,
                ]);
            } else if($validated['initial_stock'] < $oldStock){
                $material->logs()->create([
                    'user_id' => $request->user()->id ?? null,
                      'material_name'=> $validated['name'],
                    'type' => 'out',
                    'quantity' => $oldStock - $validated['initial_stock'],
                    'description' => $validated['description'] ?? 'Removing Stock',
                    'created_at' => $timestamp,
                ]);
            } 
            if($validated['name'] !== $oldName || $validated['unit'] !== $oldUnit){
                $material->logs()->create([
                    'user_id' => $request->user()->id ?? null,
                      'material_name'=> $validated['name'],
                    'type' => 'adjustment',
                    'quantity' => $validated['initial_stock'],
                    'description' => 'edited name or unit',
                    'created_at' => $timestamp,
                ]);
            }
        });

        return redirect()->back()->with('success', 'Material updated successfully.');
    }

    public function destroy(Request $request, Material $material)
    {
        $material->logs()->create([
            'user_id' => $request->user()->id ?? null,
              'material_name'=> $material->name,
            'type' => 'delete',
            'quantity' => $material->current_stock,
            'description' => 'delete items',
            'created_at' => $request->input('created_at') ?? now(),
        ]);
        $material->delete();
        
        return redirect()->back()->with('success', 'Material deleted successfully.');
    }
    
    public function add_quantity(Request $request, Material $material){
        $validated = $request->validate([
            'initial_stock' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:255',
            'created_at' => 'nullable|date',
        ]);

        $timestamp = !empty($validated['created_at'])
            ? Carbon::parse($validated['created_at'])->setTimeFrom(now())
            : now();

        $updateStock = $material->current_stock + $validated['initial_stock'];
        $material->update([
            'current_stock' => $updateStock,
        ]);

        $material->logs()->create([
            'user_id' => $request->user()->id ?? null,
            'type' => 'in',
            'material_name'=> $material->name,
            'quantity' => $validated['initial_stock'],
            'description' => $validated['description'] ?? 'Added quantity',
            'created_at' => $timestamp,
        ]);
        
        return redirect()->back()->with('success', 'Quantity added successfully.');
        
    }
}
