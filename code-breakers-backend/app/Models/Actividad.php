<?php 

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class Actividad extends Model
{
    use HasFactory;

    protected $collection = 'actividades';

    protected $fillable = [
        'docente_id',
        'title',
        'description',
        'question',
        'ageGroup', // '3-6', '7-10', '11-15'
        'difficulty', // 'facil', 'intermedio', 'dificil'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relaciones
    public function docente()
    {
        return $this->belongsTo(Docente::class, 'docente_id');
    }

    public function pasos()
    {
        return $this->hasMany(Paso::class, 'actividad_id')->orderBy('orden_correcto');
    }

    public function imagenes()
    {
        return $this->hasMany(Imagen::class, 'actividad_id');
    }

    public function estiloTexto()
    {
        return $this->hasOne(EstiloTexto::class, 'actividad_id');
    }

    public function intentosActividad()
    {
        return $this->hasMany(IntentosActividad::class, 'actividad_id');
    }

    // Accessors
    public function getLimitesPasosAttribute()
    {
        $limits = [
            'facil' => 3,
            'intermedio' => 5,
            'dificil' => 7
        ];
        return $limits[$this->difficulty] ?? 3;
    }
}
