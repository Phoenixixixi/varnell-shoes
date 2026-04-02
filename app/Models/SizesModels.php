<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SizesModels extends Model
{
    protected $table = 'sizes';
    protected $fillable = [
        'product_id',
        'size',
        'stock',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
