<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductLogs extends Model
{
    protected $table = 'products_logs';

    protected $fillable = [
        'product_id',
        'user_id',
        'type',
        'quantity'
        
    ];


    public function product(){
        return $this->belongsTo(Product::class);
    
    }

    public function user(){
        return $this->belongsTo(User::class);
    }



    
}
