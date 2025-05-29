<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MongoFresh extends Command
{
    protected $signature = 'mongo:migrate:fresh';
    protected $description = '🧹 Borra las colecciones de MongoDB y vuelve a ejecutar las migraciones';

    public function handle()
    {
        $db = DB::connection('mongodb')->getMongoDB();

        // Lista de colecciones a borrar
        $collections = ['mongo_users', 'mongo_migrations'];

        foreach ($collections as $collection) {
            if (in_array($collection, iterator_to_array($db->listCollectionNames()))) {
                $db->selectCollection($collection)->drop();
                $this->warn("🗑 Colección eliminada: $collection");
            } else {
                $this->line("ℹ️  La colección '$collection' no existe.");
            }
        }

        // Ejecutar migraciones nuevamente
        $this->call('mongo:migrate');
        $this->info('✅ Base de datos MongoDB reiniciada con éxito.');
    }
}
