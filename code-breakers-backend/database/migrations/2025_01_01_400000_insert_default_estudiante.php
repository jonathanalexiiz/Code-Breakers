<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\MongoUser;
use App\Models\Estudiante;

class InsertDefaultEstudiante extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Buscar todos los usuarios con role 'estudiante'
        $estudianteUsers = MongoUser::where('role', 'estudiante')->get();

        foreach ($estudianteUsers as $user) {
            // Verificar si ya existe el Estudiante
            $existeEstudiante = Estudiante::where('usuario_id', (string) $user->id)->first();
            
            if (!$existeEstudiante) {
                $estudiante = new Estudiante();
                $estudiante->usuario_id = (string) $user->id; // CONVERTIR A STRING
                $estudiante->save();
                
                echo "Estudiante creado para usuario: " . $user->name . " (ID: " . $user->id . ")\n";
            } else {
                echo "Estudiante ya existe para usuario: " . $user->name . "\n";
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
        Estudiante::truncate(); // Eliminar todos los Estudiantes
        echo "Todos los registros de Estudiantes han sido eliminados\n";
    }
}