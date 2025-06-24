<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'mongodb';

    public function up()
    {
        Schema::connection('mongodb')->create('intentos_actividads', function (Blueprint $collection) {
            $collection->index('actividad_id', null, ['name' => 'actividad_id_index']);
            $collection->index('estudiante_id', null, ['name' => 'estudiante_id_index']);
            $collection->index(['estudiante_id', 'actividad_id'], null, ['name' => 'estudiante_actividad_index']);
            $collection->index(['docente_id', 'actividad_id'], null, ['name' => 'docente_actividad_index']);
            $collection->index('gameCompleted', null, ['name' => 'game_completed_index']);
            $collection->index('created_at', null, ['name' => 'created_at_index']);
            $collection->timestamps();
        });
    }

    public function down()
    {
        Schema::connection('mongodb')->drop('intentos_actividads');
    }
};
