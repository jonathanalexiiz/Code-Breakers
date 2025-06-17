<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class Estudiante extends Model
{
    use HasFactory;

    protected $collection = 'estudiantes';

    protected $fillable = [
        'usuario_id',
    ];

    // Relaciones
    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function intentosActividad()
    {
        return $this->hasMany(IntentosActividad::class, 'estudiante_id');
    }
}
