<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'mongodb';

    public function up()
    {
        Schema::connection('mongodb')->create('pasos', function (Blueprint $collection) {
            $collection->index('actividad_id', null, ['name' => 'actividad_id_index']);
            $collection->index(['actividad_id', 'orden_correcto'], null, ['name' => 'actividad_orden_index']);
            $collection->timestamps();
        });
    }

    public function down()
    {
        Schema::connection('mongodb')->drop('pasos');
    }
};

