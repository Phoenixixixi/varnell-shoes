<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $table = 'payments';

    protected $fillable = [
        'order_id',
        'snap_token',
        'midtrans_order_id',
        'midtrans_transaction_id',
        'payment_type',
        'transaction_status',
        'status',
        'method',
        'gross_amout',
        'payment_time',
        'raw_response',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
