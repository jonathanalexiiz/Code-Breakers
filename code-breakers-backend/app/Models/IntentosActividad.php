<?php 

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class IntentosActividad extends Model
{
    use HasFactory;

    protected $collection = 'intentos_actividad';

    protected $fillable = [
        'actividad_id',
        'estudiante_id',
        'gameCompleted',
        'showFeedback',
        'feedback',
        'message',
    ];

    protected $casts = [
        'gameCompleted' => 'boolean',
        'showFeedback' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relaciones
    public function actividad()
    {
        return $this->belongsTo(Actividad::class, 'actividad_id');
    }

    public function estudiante()
    {
        return $this->belongsTo(Estudiante::class, 'estudiante_id');
    }

    public function respuestasUsuario()
    {
        return $this->hasMany(RespuestaUsuario::class, 'intento_id');
    }
}

