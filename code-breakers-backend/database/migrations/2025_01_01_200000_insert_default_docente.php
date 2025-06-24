<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\MongoUser;
use App\Models\Docente;

class InsertDefaultDocente extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Buscar todos los usuarios con role 'docente'
        $docenteUsers = MongoUser::where('role', 'docente')->get();

        foreach ($docenteUsers as $user) {
            // Verificar si ya existe el docente
            $existeDocente = Docente::where('usuario_id', (string) $user->id)->first();
            
            if (!$existeDocente) {
                $docente = new Docente();
                $docente->usuario_id = (string) $user->id; // CONVERTIR A STRING
                $docente->save();
                
                echo "Docente creado para usuario: " . $user->name . " (ID: " . $user->id . ")\n";
            } else {
                echo "Docente ya existe para usuario: " . $user->name . "\n";
            }
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Docente::truncate(); // Eliminar todos los docentes
        echo "Todos los registros de docentes han sido eliminados\n";
    }
}