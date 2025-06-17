<?php 

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class Imagen extends Model
{
    use HasFactory;

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
    ];

    // Relaciones
    public function actividad()
    {
        return $this->belongsTo(Actividad::class, 'actividad_id');
    }
}
