<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use MongoDB\BSON\UTCDateTime;

return new class extends Migration
{
    public function getConnection()
    {
        return 'mongodb'; // o null si es la conexión por defecto
    }

    public function up(): void
    {
        $db = DB::connection('mongodb')->getMongoDB(); // Asegúrate que 'mongodb' está en config/database.php
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

    public function down(): void
    {
        $db = DB::connection('mongodb')->getMongoDB();
        $db->selectCollection('mongo_users')->deleteMany([
            'role' => ['$in' => ['docente', 'estudiante']],
        ]);
    }
};
