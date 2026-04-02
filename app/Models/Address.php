<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    protected $table = 'address';

    protected $fillable = [
        'user_id',
        'postal_code',
        'city',
        'subdistrict',
        'ward',
        'addresses',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
