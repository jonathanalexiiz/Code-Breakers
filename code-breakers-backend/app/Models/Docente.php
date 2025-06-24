<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class Docente extends Model
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'docentes';

    protected $fillable = [
        'usuario_id',
    ];

    // Relaciones
    public function usuario()
    {
        return $this->belongsTo(MongoUser::class, 'usuario_id');
    }

    public function actividades()
    {
        return $this->hasMany(Actividad::class, 'docente_id');
    }
}
