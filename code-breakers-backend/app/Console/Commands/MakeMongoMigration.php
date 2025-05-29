<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class MakeMongoMigration extends Command
{
    protected $signature = 'make:mongo-migration {name}';
    protected $description = 'Crea un nuevo archivo de migración para MongoDB con timestamps y validación de duplicados';

    public function handle()
    {
        $name = Str::snake($this->argument('name'));
        $timestamp = now()->format('Y_m_d_His');
        $filename = "{$timestamp}_{$name}.php";

        $path = database_path('mongo-migrations');

        if (!File::exists($path)) {
            File::makeDirectory($path, 0755, true);
        }

        $content = <<<PHP
<?php

use Illuminate\Support\Facades\Hash;
use MongoDB\BSON\UTCDateTime;

return new class {
    public function up(\$db) {
        \$now = new UTCDateTime(now()->valueOf());
        \$users = \$db->selectCollection('mongo_users');

        if (!\$users->findOne(['email' => 'admin@admin.com'])) {
            \$users->insertOne([
                'name'       => 'Admin Principal',
                'email'      => 'admin@admin.com',
                'role'       => 'docente',
                'password'   => Hash::make('admin123'),
                'created_at' => \$now,
                'updated_at' => \$now,
            ]);
        }

        if (!\$users->findOne(['email' => 'estudiante@demo.com'])) {
            \$users->insertOne([
                'name'       => 'Estudiante Demo',
                'email'      => 'estudiante@demo.com',
                'role'       => 'estudiante',
                'password'   => Hash::make('estudiante123'),
                'created_at' => \$now,
                'updated_at' => \$now,
            ]);
        }
    }

    public function down(\$db) {
        \$db->selectCollection('mongo_users')->deleteMany([
            ['email' => 'admin@admin.com'],
            ['email' => 'estudiante@demo.com']
        ]);
    }
};
PHP;

        File::put("{$path}/{$filename}", $content);

        $this->info("📝 Migración MongoDB creada: database/mongo-migrations/{$filename}");
    }
}
