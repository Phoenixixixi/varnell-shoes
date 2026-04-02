<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shipment extends Model
{
    protected $table = 'shipment';

    protected $fillable = [
        'order_id',
        'courier',
        'tracking_number',
        'status',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
