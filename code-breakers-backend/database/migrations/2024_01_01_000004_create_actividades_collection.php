<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'mongodb';

    public function up()
    {
        Schema::connection('mongodb')->create('actividades', function (Blueprint $collection) {
            $collection->index('docente_id', null, ['name' => 'docente_id_index']);
            $collection->index('difficulty', null, ['name' => 'difficulty_index']);
            $collection->index('ageGroup', null, ['name' => 'ageGroup_index']);
            $collection->index('created_at', null, ['name' => 'created_at_index']);
            $collection->timestamps();
        });
    }

    public function down()
    {
        Schema::connection('mongodb')->drop('actividades');
    }
};
