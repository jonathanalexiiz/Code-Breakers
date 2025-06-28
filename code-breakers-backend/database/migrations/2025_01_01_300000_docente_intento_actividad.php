<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\IntentosActividad;

return new class extends Migration
{
    protected $connection = 'mongodb';

    public function up(): void
    {
        // Agregar campos a documentos existentes (opcional)
        IntentosActividad::whereNull('is_preview')->update(['is_preview' => false]);
    }

    public function down(): void
    {
        // Revertir los cambios (opcional)
        IntentosActividad::unset('is_preview');
    }
};
