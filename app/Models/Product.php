<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'description',
        'price',
        'stock',
        'recipe_id',
        'created_at',
    ];

    public function descriptions()
    {
        return $this->hasMany(ProductDescList::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }
    public function ProductLogs(){
        return $this->hasMany(ProductLogs::class);   
    }
    public function sizes(){
        return $this->hasMany(SizesModels::class);
    }
    public function colors(){
        return $this->hasMany(Colors::class);
    }
    
    public function recipe()
    {
        return $this->belongsTo(Recipe::class);
    }
}
