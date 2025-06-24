<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('intentos_actividad', function (Blueprint $table) {
            // Remove after() method calls since MongoDB doesn't support column positioning
            $table->string('docente_id')->nullable();
            $table->boolean('is_preview')->default(false);
            
            // Hacer estudiante_id nullable para permitir intentos de preview
            $table->string('estudiante_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('intentos_actividad', function (Blueprint $table) {
            $table->dropColumn(['docente_id', 'is_preview']);
            $table->string('estudiante_id')->nullable(false)->change();
        });
    }
};