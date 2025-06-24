<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class Imagen extends Model
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'imagenes';

    protected $fillable = [
        'actividad_id',
        'src',
        'width',
        'height',
        'x',
        'y',
    ];

    protected $casts = [
        'width' => 'integer',
        'height' => 'integer',
        'x' => 'integer',
        'y' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public $timestamps = true;

    public function actividad()
    {
        return $this->belongsTo(Actividad::class, 'actividad_id');
    }
}
