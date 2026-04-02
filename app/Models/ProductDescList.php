<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductDescList extends Model
{
    protected $table = 'product_desc_lists';

    protected $fillable = [
        'product_id',
        'list',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
