<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class MongoMigrate extends Command
{
    protected $signature = 'mongo:migrate';
    protected $description = 'Ejecuta migraciones personalizadas para MongoDB';

    public function handle()
    {
        $migrationPath = database_path('mongo-migrations');

        // Obtener conexión Mongo nativa
        $db = DB::connection('mongodb')->getMongoDB();

        // CORREGIDO: usar selectCollection() en lugar de collection()
        $changelog = $db->selectCollection('mongo_migrations');

        $applied = $changelog->find([], ['projection' => ['filename' => 1]])->toArray();
        $appliedFilenames = array_column($applied, 'filename');

        $files = collect(File::files($migrationPath))
            ->sortBy(fn($f) => $f->getFilename());

        foreach ($files as $file) {
            $filename = $file->getFilename();

            if (in_array($filename, $appliedFilenames)) {
                $this->line("⏩ $filename ya fue aplicado.");
                continue;
            }

            require_once $file->getRealPath();
            $migration = require $file->getRealPath();

            if (method_exists($migration, 'up')) {
                $migration->up($db);
                $changelog->insertOne([
                    'filename' => $filename,
                    'applied_at' => now()
                ]);
                $this->info("✅ Migración aplicada: $filename");
            } else {
                $this->warn("⚠️  $filename no tiene método up().");
            }
        }

        $this->info('✔ Todas las migraciones pendientes fueron ejecutadas.');
    }
}
