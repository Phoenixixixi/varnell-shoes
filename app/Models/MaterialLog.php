<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MaterialLog extends Model
{
    protected $table = 'raw_material_logs';

    protected $fillable = [
        'material_id',
        'material_name',
        'user_id',
        'type',
        'quantity',
        'description',
    ];

    public function material()
    {
        return $this->belongsTo(Material::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
