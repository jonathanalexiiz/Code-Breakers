<?php 
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class RespuestaUsuario extends Model
{
    use HasFactory;

    protected $collection = 'respuestas_usuario';

    protected $fillable = [
        'intento_id',
        'paso_orden',
        'userAnswer',
    ];

    protected $casts = [
        'paso_orden' => 'integer',
    ];

    // Relaciones
    public function intentoActividad()
    {
        return $this->belongsTo(IntentosActividad::class, 'intento_id');
    }
}
