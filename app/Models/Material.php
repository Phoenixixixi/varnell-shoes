<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    protected $table = 'raw_materials';

    protected $fillable = [
        'name',
        'unit',
        'current_stock',
    ];

    public function logs()
    {
        return $this->hasMany(MaterialLog::class);
    }
}
