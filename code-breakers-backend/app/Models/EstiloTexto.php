<?php 

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;

class EstiloTexto extends Model
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'estilos_texto';

    protected $fillable = [
        'actividad_id',
        'textColor',
        'fontSize',
        'fontWeight',
        'fontStyle',
        'textDecoration',
        'textAlign',
        'containerHeight',
    ];

    protected $casts = [
        'containerHeight' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public $timestamps = true;

    public function actividad()
    {
        return $this->belongsTo(Actividad::class, 'actividad_id');
    }
}
