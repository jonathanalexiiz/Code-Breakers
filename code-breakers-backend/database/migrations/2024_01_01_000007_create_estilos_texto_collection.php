<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'mongodb';

    public function up()
    {
        Schema::connection('mongodb')->create('estilos_textos', function (Blueprint $collection) {
            $collection->index('actividad_id', null, ['name' => 'actividad_id_unique', 'unique' => true]);
            $collection->timestamps();
        });
    }

    public function down()
    {
        Schema::connection('mongodb')->drop('estilos_textos');
    }
};