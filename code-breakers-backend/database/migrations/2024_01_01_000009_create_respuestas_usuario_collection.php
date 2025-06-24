<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'mongodb';

    public function up()
    {
        Schema::connection('mongodb')->create('respuesta_usuarios', function (Blueprint $collection) {
            $collection->index('intento_id', null, ['name' => 'intento_id_index']);
            $collection->index(['intento_id', 'paso_orden'], null, ['name' => 'intento_paso_index']);
            $collection->timestamps();
        });
    }

    public function down()
    {
        Schema::connection('mongodb')->drop('respuesta_usuarios');
    }
};