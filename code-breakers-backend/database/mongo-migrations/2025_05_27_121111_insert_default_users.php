<?php

use Illuminate\Support\Facades\Hash;
use MongoDB\BSON\UTCDateTime;

return new class {
    public function up($db) {
    $now = new UTCDateTime(now()->valueOf());
    $users = $db->selectCollection('mongo_users');

    $data = [
        [
            'name'       => 'Marcos Marin',
            'email'      => 'marcos@gmail.com',
            'role'       => 'docente',
            'password'   => Hash::make('marcos123'),
        ],
        [
            'name'       => 'Carlos Pérez',
            'email'      => 'carlos@hotmail.es',
            'role'       => 'docente',
            'password'   => Hash::make('carlos123'),
        ],
        [
            'name'       => 'Pedro Sanchez',
            'email'      => 'pedro@yahoo.com',
            'role'       => 'estudiante',
            'password'   => Hash::make('pedro123'),
        ],
        [
            'name'       => 'Lucía Ramírez',
            'email'      => 'lucia@yahoo.com',
            'role'       => 'estudiante',
            'password'   => Hash::make('lucia123'),
        ],
    ];

    foreach ($data as $user) {
        if (!$users->findOne(['email' => $user['email']])) {
            $user['created_at'] = $now;
            $user['updated_at'] = $now;
            $users->insertOne($user);
        }
    }
}


   public function down($db) {
    $timestamp = new UTCDateTime(now()->valueOf());

    $db->selectCollection('mongo_users')->deleteMany([
        'role' => ['$in' => ['docente', 'estudiante']],
        'created_at' => ['$gte' => $timestamp] // opcional si usas un timestamp conocido
    ]);
}

};
