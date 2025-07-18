<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class Paso extends Model
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'pasos';

    protected $fillable = [
        'actividad_id',
        'descripcion_paso',
        'orden_correcto',
    ];

    protected $casts = [
        'orden_correcto' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public $timestamps = true;

    // Relaciones
    public function actividad()
    {
        return $this->belongsTo(Actividad::class, 'actividad_id');
    }
     public function respuestasUsuario()
    {
        return $this->hasMany(RespuestaUsuario::class, 'paso_id');
    }
}

   

