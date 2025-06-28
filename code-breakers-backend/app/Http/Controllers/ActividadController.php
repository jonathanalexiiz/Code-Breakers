<?php

namespace App\Http\Controllers;

use App\Models\Actividad;
use App\Models\Paso;
use App\Models\Imagen;
use App\Models\EstiloTexto;
use App\Models\Docente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class ActividadController extends Controller
{
    /**
     * Obtener todas las actividades del docente autenticado
     */
    public function index()
    {
        try {
            $user = Auth::user();
            $docente = Docente::where('usuario_id', $user->id)->first();

            if (!$docente) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no es un docente'
                ], 403);
            }

            $actividads = Actividad::where('docente_id', $docente->id)
                ->with(['pasos', 'imagenes', 'estiloTexto'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $actividads
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener actividades: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener una actividad específica con todos sus datos
     */
    public function show($id)
    {
        try {
            $actividad = Actividad::with(['pasos', 'imagenes', 'estiloTexto', 'docente'])
                ->find($id);

            if (!$actividad) {
                return response()->json([
                    'success' => false,
                    'message' => 'Actividad no encontrada'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $actividad
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener actividad: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear una nueva actividad con todos sus componentes
     */
    public function store(Request $request)
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'No autenticado. Por favor, inicia sesión.'
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'question' => 'required|string',
            'ageGroup' => 'required|in:3-6,7-10,11-15',
            'difficulty' => 'required|in:facil,intermedio,dificil',
            'steps' => 'required|array|min:1',
            'steps.*' => 'required|string',
            'images' => 'sometimes|array',
            'images.*.src' => 'required|string',
            'images.*.width' => 'required|integer|min:20',
            'images.*.height' => 'required|integer|min:20',
            'images.*.x' => 'required|integer',
            'images.*.y' => 'required|integer',
            'textStyles' => 'sometimes|array',
            'textStyles.textColor' => 'sometimes|string',
            'textStyles.fontSize' => 'sometimes|string',
            'textStyles.fontWeight' => 'sometimes|string',
            'textStyles.fontStyle' => 'sometimes|string',
            'textStyles.textDecoration' => 'sometimes|string',
            'textStyles.textAlign' => 'sometimes|string',
            'textStyles.containerHeight' => 'sometimes|integer'
        ]);

        if ($validator->fails()) {
            Log::error('Validation failed:', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Obtener el docente actual
            $user = Auth::user();
            $docente = Docente::where('usuario_id', $user->id)->first();

            if (!$docente) {
                Log::error('Usuario no es docente:', ['user_id' => $user->id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no es un docente'
                ], 403);
            }

            // Validar límites de pasos según dificultad
            $limits = [
                'facil' => 3,
                'intermedio' => 5,
                'dificil' => 7
            ];

            $maxSteps = $limits[$request->difficulty];
            if (count($request->steps) > $maxSteps) {
                return response()->json([
                    'success' => false,
                    'message' => "La dificultad {$request->difficulty} permite máximo {$maxSteps} pasos"
                ], 422);
            }
 
            $actividad = new Actividad([
                'docente_id' => $docente->id,
                'title' => $request->title,
                'description' => $request->description,
                'question' => $request->question,
                'ageGroup' => $request->ageGroup,
                'difficulty' => $request->difficulty,
            ]);

            $resultado = $actividad->save();
            $idString = (string) $actividad->_id;
            
            if (!$resultado) {
                throw new \Exception('No se pudo guardar la actividad');
            }

            Log::info('Actividad creada con ID:', ['id' => $actividad->id]);

            // Crear los pasos
            $pasosCreados = [];
            foreach ($request->steps as $index => $stepDescription) {
                $paso = new Paso([
                    'actividad_id' => $actividad->id,
                    'descripcion_paso' => $stepDescription,
                    'orden_correcto' => $index + 1
                ]);

                if (!$paso->save()) {
                    // Si falla, limpiar pasos creados
                    foreach ($pasosCreados as $pasoCreado) {
                        $pasoCreado->delete();
                    }
                    $actividad->delete();
                    throw new \Exception("Error al guardar el paso " . ($index + 1));
                }
                $pasosCreados[] = $paso;
                Log::info('Paso creado:', ['paso_id' => $paso->id, 'actividad_id' => $actividad->id]);
            }

            // Crear las imágenes si existen
            $imagenesCreadas = [];
            if ($request->has('images') && is_array($request->images)) {
                foreach ($request->images as $imageData) {
                    $imagen = new Imagen([
                        'actividad_id' => $actividad->id,
                        'src' => $imageData['src'],
                        'width' => $imageData['width'],
                        'height' => $imageData['height'],
                        'x' => $imageData['x'],
                        'y' => $imageData['y']
                    ]);

                    if (!$imagen->save()) {
                        // Limpiar en caso de error
                        foreach ($imagenesCreadas as $imagenCreada) {
                            $imagenCreada->delete();
                        }
                        foreach ($pasosCreados as $pasoCreado) {
                            $pasoCreado->delete();
                        }
                        $actividad->delete();
                        throw new \Exception("Error al guardar imagen");
                    }
                    $imagenesCreadas[] = $imagen;
                    Log::info('Imagen creada:', ['imagen_id' => $imagen->id]);
                }
            }

            // Crear estilos de texto si existen
            if ($request->has('textStyles')) {
                $textStyles = $request->textStyles;
                $estiloTexto = new EstiloTexto([
                    'actividad_id' => $actividad->id,
                    'textColor' => $textStyles['textColor'] ?? '#000000',
                    'fontSize' => $textStyles['fontSize'] ?? '16px',
                    'fontWeight' => $textStyles['fontWeight'] ?? 'normal',
                    'fontStyle' => $textStyles['fontStyle'] ?? 'normal',
                    'textDecoration' => $textStyles['textDecoration'] ?? 'none',
                    'textAlign' => $textStyles['textAlign'] ?? 'left',
                    'containerHeight' => $textStyles['containerHeight'] ?? 300
                ]);

                if (!$estiloTexto->save()) {
                    // Limpiar en caso de error
                    foreach ($imagenesCreadas as $imagenCreada) {
                        $imagenCreada->delete();
                    }
                    foreach ($pasosCreados as $pasoCreado) {
                        $pasoCreado->delete();
                    }
                    $actividad->delete();
                    throw new \Exception("Error al guardar estilos de texto");
                }
                Log::info('Estilo de texto creado:', ['estilo_id' => $estiloTexto->id]);
            }

            // Cargar la actividad completa para devolverla
            $actividadCompleta = Actividad::with(['pasos', 'imagenes', 'estiloTexto'])
                ->find($actividad->id);

            if (!$actividadCompleta) {
                throw new \Exception('No se pudo recuperar la actividad guardada');
            }

            Log::info('Actividad guardada exitosamente:', ['id' => $actividad->id]);

            return response()->json([
                'success' => true,
                'message' => 'Actividad creada exitosamente',
                'data' => $actividadCompleta
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error al crear actividad:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al crear actividad: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar una actividad existente
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'question' => 'sometimes|string',
            'ageGroup' => 'sometimes|in:3-6,7-10,11-15',
            'difficulty' => 'sometimes|in:facil,intermedio,dificil',
            'steps' => 'sometimes|array|min:1',
            'steps.*' => 'required|string',
            'images' => 'sometimes|array',
            'textStyles' => 'sometimes|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $actividad = Actividad::find($id);
            if (!$actividad) {
                return response()->json([
                    'success' => false,
                    'message' => 'Actividad no encontrada'
                ], 404);
            }

            // Verificar que el docente sea el propietario
            $user = Auth::user();
            $docente = Docente::where('usuario_id', $user->id)->first();

            if (!$docente || $actividad->docente_id !== $docente->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para editar esta actividad'
                ], 403);
            }

            // Actualizar actividad
            $actividad->update($request->only([
                'title',
                'description',
                'question',
                'ageGroup',
                'difficulty'
            ]));

            // Actualizar pasos si se proporcionan
            if ($request->has('steps')) {
                // Eliminar pasos existentes
                Paso::where('actividad_id', $actividad->id)->delete();

                // Crear nuevos pasos
                foreach ($request->steps as $index => $stepDescription) {
                    Paso::create([
                        'actividad_id' => $actividad->id,
                        'descripcion_paso' => $stepDescription,
                        'orden_correcto' => $index + 1
                    ]);
                }
            }

            // Actualizar imágenes si se proporcionan
            if ($request->has('images')) {
                // Eliminar imágenes existentes
                Imagen::where('actividad_id', $actividad->id)->delete();

                // Crear nuevas imágenes
                foreach ($request->images as $imageData) {
                    Imagen::create([
                        'actividad_id' => $actividad->id,
                        'src' => $imageData['src'],
                        'width' => $imageData['width'],
                        'height' => $imageData['height'],
                        'x' => $imageData['x'],
                        'y' => $imageData['y']
                    ]);
                }
            }

            // Actualizar estilos de texto si se proporcionan
            if ($request->has('textStyles')) {
                $textStyles = $request->textStyles;
                $estiloTexto = EstiloTexto::where('actividad_id', $actividad->id)->first();

                if ($estiloTexto) {
                    $estiloTexto->update([
                        'textColor' => $textStyles['textColor'] ?? $estiloTexto->textColor,
                        'fontSize' => $textStyles['fontSize'] ?? $estiloTexto->fontSize,
                        'fontWeight' => $textStyles['fontWeight'] ?? $estiloTexto->fontWeight,
                        'fontStyle' => $textStyles['fontStyle'] ?? $estiloTexto->fontStyle,
                        'textDecoration' => $textStyles['textDecoration'] ?? $estiloTexto->textDecoration,
                        'textAlign' => $textStyles['textAlign'] ?? $estiloTexto->textAlign,
                        'containerHeight' => $textStyles['containerHeight'] ?? $estiloTexto->containerHeight
                    ]);
                } else {
                    EstiloTexto::create([
                        'actividad_id' => $actividad->id,
                        'textColor' => $textStyles['textColor'] ?? '#000000',
                        'fontSize' => $textStyles['fontSize'] ?? '16px',
                        'fontWeight' => $textStyles['fontWeight'] ?? 'normal',
                        'fontStyle' => $textStyles['fontStyle'] ?? 'normal',
                        'textDecoration' => $textStyles['textDecoration'] ?? 'none',
                        'textAlign' => $textStyles['textAlign'] ?? 'left',
                        'containerHeight' => $textStyles['containerHeight'] ?? 300
                    ]);
                }
            }

            // Cargar la actividad actualizada
            $actividadActualizada = Actividad::with(['pasos', 'imagenes', 'estiloTexto'])
                ->find($actividad->id);

            return response()->json([
                'success' => true,
                'message' => 'Actividad actualizada exitosamente',
                'data' => $actividadActualizada
            ]);
        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar actividad: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar una actividad
     */
    public function destroy($id)
    {
        try {
            $actividad = Actividad::find($id);
            if (!$actividad) {
                return response()->json([
                    'success' => false,
                    'message' => 'Actividad no encontrada'
                ], 404);
            }

            // Verificar que el docente sea el propietario
            $user = Auth::user();
            $docente = Docente::where('usuario_id', $user->id)->first();

            if (!$docente || $actividad->docente_id !== $docente->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para eliminar esta actividad'
                ], 403);
            }

            // Eliminar todos los datos relacionados
            Paso::where('actividad_id', $id)->delete();
            Imagen::where('actividad_id', $id)->delete();
            EstiloTexto::where('actividad_id', $id)->delete();

            // Eliminar la actividad
            $actividad->delete();

            return response()->json([
                'success' => true,
                'message' => 'Actividad eliminada exitosamente'
            ]);
        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar actividad: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener actividades por filtros (edad, dificultad)
     */
    public function getByFilters(Request $request)
    {
        try {
            $query = Actividad::with(['pasos', 'imagenes', 'estiloTexto', 'docente.usuario']);

            if ($request->has('ageGroup')) {
                $query->where('ageGroup', $request->ageGroup);
            }

            if ($request->has('difficulty')) {
                $query->where('difficulty', $request->difficulty);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('question', 'like', "%{$search}%");
                });
            }

            $actividads = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $actividads
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener actividades: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validar estructura de actividad antes de guardar
     */
    public function validateActivity(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'question' => 'required|string',
            'ageGroup' => 'required|in:3-6,7-10,11-15',
            'difficulty' => 'required|in:facil,intermedio,dificil',
            'steps' => 'required|array|min:1',
            'steps.*' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validación fallida',
                'errors' => $validator->errors()
            ], 422);
        }

        // Validar límites de pasos
        $limits = [
            'facil' => 3,
            'intermedio' => 5,
            'dificil' => 7
        ];

        $maxSteps = $limits[$request->difficulty];
        if (count($request->steps) > $maxSteps) {
            return response()->json([
                'success' => false,
                'message' => "La dificultad {$request->difficulty} permite máximo {$maxSteps} pasos",
                'maxSteps' => $maxSteps
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Actividad válida',
            'maxSteps' => $maxSteps
        ]);
    }
}