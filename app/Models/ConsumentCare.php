<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConsumentCare extends Model
{
    protected $table = 'consument_care';

    protected $fillable = [
        'user_id',
        'name',
        'email',
        'messages',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
