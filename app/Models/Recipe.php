<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Recipe extends Model
{
    protected $table = 'shoe_recipes';

    protected $fillable = [
        'name',
        'description',
    ];

    public function items()
    {
        return $this->hasMany(RecipeItem::class);
    }
    
    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
