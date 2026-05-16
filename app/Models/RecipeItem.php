<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RecipeItem extends Model
{
    protected $table = 'shoe_recipe_items';

    protected $fillable = [
        'recipe_id',
        'material_id',
        'quantity_required',
    ];

    public function recipe()
    {
        return $this->belongsTo(Recipe::class);
    }
    

    public function material()
    {
        return $this->belongsTo(Material::class);
    }
}
