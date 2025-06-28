<?php

namespace App\Http\Controllers;

use App\Models\Actividad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ActividadEstudianteController extends Controller
{
    /**
     * Obtener todas las actividades disponibles para los estudiantes,
     * con opción de filtrar por edad y dificultad.
     */
    public function index(Request $request)
    {
        try {
            Log::info('🔍 Obteniendo actividades para estudiante', [
                'filters' => $request->only(['ageGroup', 'difficulty'])
            ]);

            $query = Actividad::with(['docente.usuario', 'pasos', 'imagenes', 'estiloTexto']);

            // Filtrar actividades que tengan nombre válido (ya sea en 'nombre' o 'title')
            $query->where(function ($q) {
                $q->where(function ($subQ) {
                    $subQ->whereNotNull('nombre')->where('nombre', '!=', '');
                })->orWhere(function ($subQ) {
                    $subQ->whereNotNull('title')->where('title', '!=', '');
                });
            });

            if ($request->has('ageGroup') && $request->ageGroup) {
                $query->where('ageGroup', $request->ageGroup);
            }

            if ($request->has('difficulty') && $request->difficulty) {
                $query->where('difficulty', $request->difficulty);
            }

            $actividades = $query->orderBy('created_at', 'desc')->get();

            // 🔥 NORMALIZAR LOS CAMPOS para mantener consistencia
            $actividadesNormalizadas = $actividades->map(function ($actividad) {
                return [
                    'id' => $actividad->id,
                    '_id' => $actividad->id, // Para compatibilidad
                    'title' => $actividad->title ?: $actividad->nombre,
                    'nombre' => $actividad->title ?: $actividad->nombre, // Para compatibilidad
                    'description' => $actividad->description ?: $actividad->descripcion,
                    'descripcion' => $actividad->description ?: $actividad->descripcion, // Para compatibilidad
                    'question' => $actividad->question ?: $actividad->pregunta,
                    'pregunta' => $actividad->question ?: $actividad->pregunta, // Para compatibilidad
                    'ageGroup' => $actividad->ageGroup,
                    'difficulty' => $actividad->difficulty,
                    'docente_id' => $actividad->docente_id,
                    'created_at' => $actividad->created_at,
                    'updated_at' => $actividad->updated_at,
                    'docente' => $actividad->docente,
                    'pasos' => $actividad->pasos,
                    'imagenes' => $actividad->imagenes,
                    'estilo_texto' => $actividad->estiloTexto
                ];
            });

            Log::info('✅ Actividades encontradas', [
                'count' => $actividadesNormalizadas->count(),
                'ids' => $actividadesNormalizadas->pluck('id')->toArray()
            ]);

            return response()->json([
                'success' => true,
                'data' => $actividadesNormalizadas,
                'message' => "Se encontraron {$actividadesNormalizadas->count()} actividades"
            ]);
        } catch (\Throwable $e) {
            Log::error('❌ Error al obtener actividades', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno'
            ], 500);
        }
    }

    /**
     * Obtener una actividad específica para el juego del estudiante
     */
    public function show($id)
    {
        try {
            Log::info('🎮 Obteniendo actividad para juego', [
                'actividad_id' => $id
            ]);

            // Buscar la actividad por id o _id
            $actividad = Actividad::with(['docente.usuario', 'pasos', 'imagenes', 'estiloTexto'])
                ->where('_id', $id)
                ->orWhere('id', $id)
                ->first();

            if (!$actividad) {
                throw new \Illuminate\Database\Eloquent\ModelNotFoundException();
            }

            // Validar que la actividad tenga un nombre
            $nombre = $actividad->title ?: $actividad->nombre;
            if (!$nombre || trim($nombre) === '') {
                Log::warning('⚠️ Actividad sin nombre válido', [
                    'actividad_id' => $id,
                    'nombre' => $actividad->nombre,
                    'title' => $actividad->title
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Esta actividad no tiene un nombre válido'
                ], 422);
            }

            // Validar que tenga pasos
            if ($actividad->pasos->isEmpty()) {
                Log::warning('⚠️ Actividad sin pasos', [
                    'actividad_id' => $id
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Esta actividad no tiene pasos configurados'
                ], 422);
            }

            // Filtrar y mapear pasos válidos
            $pasos = $actividad->pasos->filter(function ($paso) {
                $contenido = $paso->descripcion_paso ?? $paso->descripcion ?? '';
                return !empty(trim($contenido));
            })->map(function ($paso) {
                return $paso->descripcion_paso ?? $paso->descripcion ?? '';
            })->values()->toArray();

            if (empty($pasos)) {
                Log::warning('⚠️ Actividad con pasos vacíos', [
                    'actividad_id' => $id,
                    'total_pasos' => $actividad->pasos->count(),
                    'pasos_debug' => $actividad->pasos->map(function ($paso) {
                        return [
                            'id' => $paso->id,
                            'descripcion_paso' => $paso->descripcion_paso ?? 'null',
                            'descripcion' => $paso->descripcion ?? 'null',
                            'orden_correcto' => $paso->orden_correcto
                        ];
                    })->toArray()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Esta actividad tiene pasos sin contenido válido'
                ], 422);
            }

            // Mezclar pasos para el juego
            $shuffledSteps = collect($pasos)->shuffle()->values()->toArray();

            // Armar respuesta
            $gameData = [
                'id' => $actividad->id,
                '_id' => $actividad->id, // compatibilidad
                'title' => $actividad->title ?: $actividad->nombre,
                'nombre' => $actividad->title ?: $actividad->nombre,
                'description' => $actividad->description ?: $actividad->descripcion ?: 'Sin descripción disponible',
                'descripcion' => $actividad->description ?: $actividad->descripcion ?: 'Sin descripción disponible',
                'question' => $actividad->question ?: $actividad->pregunta ?: '¿Puedes ordenar los pasos correctamente?',
                'pregunta' => $actividad->question ?: $actividad->pregunta ?: '¿Puedes ordenar los pasos correctamente?',
                'ageGroup' => $actividad->ageGroup,
                'difficulty' => $actividad->difficulty,
                'shuffledSteps' => $shuffledSteps,
                'totalSteps' => count($pasos),
                'correctSteps' => $pasos,
                'created_at' => $actividad->created_at,
                'updated_at' => $actividad->updated_at,
                'docente_id' => $actividad->docente_id,
                'docente' => $actividad->docente ? [
                    'id' => $actividad->docente->id,
                    'nombre' => $actividad->docente->usuario->nombre ?? 'Docente'
                ] : null,
                'pasos' => $actividad->pasos,
                'imagenes' => $actividad->imagenes,
                'estilo_texto' => $actividad->estiloTexto
            ];

            Log::info('✅ Actividad preparada para juego', [
                'actividad_id' => $id,
                'title' => $gameData['title'],
                'total_pasos' => count($pasos)
            ]);

            return response()->json([
                'success' => true,
                'data' => $gameData,
                'message' => 'Actividad cargada correctamente'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('🔍 Actividad no encontrada', [
                'actividad_id' => $id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'La actividad solicitada no existe'
            ], 404);
        } catch (\Throwable $e) {
            Log::error('❌ Error al obtener actividad', [
                'actividad_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno'
            ], 500);
        }
    }


    /**
     * Verificar el estado de las actividades (para debug)
     */
    public function debug()
    {
        try {
            $actividades = Actividad::with(['pasos'])->get();

            $debug_info = $actividades->map(function ($actividad) {
                return [
                    'id' => $actividad->id,
                    'nombre' => $actividad->nombre,
                    'title' => $actividad->title,
                    'campo_usado' => $actividad->title ?: $actividad->nombre,
                    'nombre_valido' => !empty(trim($actividad->title ?: $actividad->nombre ?: '')),
                    'total_pasos' => $actividad->pasos->count(),
                    'pasos_con_contenido' => $actividad->pasos->filter(function ($paso) {
                        // ✅ CORRECCIÓN: Verificar descripcion_paso
                        $contenido = $paso->descripcion_paso ?? $paso->descripcion ?? '';
                        return !empty(trim($contenido));
                    })->count(),
                    'pasos_detalle' => $actividad->pasos->map(function ($paso) {
                        return [
                            'id' => $paso->id,
                            'descripcion_paso' => $paso->descripcion_paso,
                            'descripcion' => $paso->descripcion ?? 'null',
                            'orden_correcto' => $paso->orden_correcto,
                            'tiene_contenido' => !empty(trim($paso->descripcion_paso ?? $paso->descripcion ?? ''))
                        ];
                    })->toArray(),
                    'created_at' => $actividad->created_at
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $debug_info,
                'total_actividades' => $actividades->count()
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en debug',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
