<?php

namespace App\Http\Controllers;

use App\Models\Actividad;
use App\Models\Estudiante;
use App\Models\IntentosActividad;
use App\Models\RespuestaUsuario;
use App\Models\Docente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class JuegoController extends Controller
{
    public function getGameActivity($id)
    {
        try {
            $actividad = Actividad::with(['pasos', 'imagenes', 'estiloTexto'])
                ->find($id);

            if (!$actividad) {
                return response()->json([
                    'success' => false,
                    'message' => 'Actividad no encontrada'
                ], 404);
            }

            // Obtener pasos ordenados correctamente
            $pasosCorrectos = $actividad->pasos()->orderBy('orden_correcto')->get();

            // Crear versión mezclada de los pasos (solo descripción)
            $pasosMezclados = $pasosCorrectos->pluck('descripcion_paso')->shuffle()->values();

            $gameData = [
                'id' => $actividad->_id, // Usar _id para MongoDB
                'title' => $actividad->title,
                'description' => $actividad->description,
                'question' => $actividad->question,
                'ageGroup' => $actividad->ageGroup,
                'difficulty' => $actividad->difficulty,
                'images' => $actividad->imagenes,
                'textStyles' => $actividad->estiloTexto,
                'shuffledSteps' => $pasosMezclados,
                'correctSteps' => $pasosCorrectos->pluck('descripcion_paso')->values(), // Agregar pasos correctos
                'totalSteps' => $pasosCorrectos->count(),
                'limitesPasos' => $actividad->limites_pasos
            ];

            return response()->json([
                'success' => true,
                'data' => $gameData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener actividad para juego: ' . $e->getMessage()
            ], 500);
        }
    }


    public function startAttempt(Request $request, $actividadId)
    {
        $validator = Validator::make($request->all(), [
            'estudiante_id' => 'sometimes|string',
            'preview_mode' => 'sometimes|boolean' // Nuevo parámetro para modo preview
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = Auth::user();
            $previewMode = $request->get('preview_mode', false);

            // Verificar que la actividad existe
            $actividad = Actividad::find($actividadId);
            if (!$actividad) {
                return response()->json([
                    'success' => false,
                    'message' => 'Actividad no encontrada'
                ], 404);
            }

            // Si es modo preview (para docentes)
            if ($previewMode) {
                // Verificar que el usuario sea docente y propietario de la actividad
                $docente = Docente::where('usuario_id', $user->id)->first();
                if (!$docente) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Solo los docentes pueden usar el modo preview'
                    ], 403);
                }

                // Verificar que el docente sea propietario de la actividad
                if ($actividad->docente_id !== $docente->id) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Solo puedes previsualizar tus propias actividads'
                    ], 403);
                }

                // Crear intento de preview (temporal)
                $intento = IntentosActividad::create([
                    'actividad_id' => $actividadId,
                    'estudiante_id' => null, // NULL para intentos de preview
                    'docente_id' => $docente->id, // Agregar este campo a la tabla si no existe
                    'gameCompleted' => false,
                    'showFeedback' => false,
                    'feedback' => '',
                    'message' => '',
                    'is_preview' => true // Marcar como preview
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Vista previa iniciada exitosamente',
                    'data' => [
                        'intento_id' => $intento->id,
                        'actividad_id' => $actividadId,
                        'preview_mode' => true,
                        'docente_id' => $docente->id
                    ]
                ], 201);
            }

            // Modo normal (para estudiantes)
            // Obtener estudiante
            if ($request->has('estudiante_id')) {
                $estudiante = Estudiante::find($request->estudiante_id);
            } else {
                $estudiante = Estudiante::where('usuario_id', $user->id)->first();
            }

            if (!$estudiante) {
                return response()->json([
                    'success' => false,
                    'message' => 'Estudiante no encontrado. Para ver la vista previa, usa el parámetro preview_mode=true'
                ], 404);
            }

            // Crear nuevo intento normal
            $intento = IntentosActividad::create([
                'actividad_id' => $actividadId,
                'estudiante_id' => $estudiante->id,
                'gameCompleted' => false,
                'showFeedback' => false,
                'feedback' => '',
                'message' => '',
                'is_preview' => false
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Intento iniciado exitosamente',
                'data' => [
                    'intento_id' => $intento->id,
                    'actividad_id' => $actividadId,
                    'estudiante_id' => $estudiante->id,
                    'preview_mode' => false
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al iniciar intento: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Guardar respuestas del usuario y evaluar
     * Modificado para manejar intentos de preview
     */
    public function submitAnswers(Request $request, $intentoId)
    {
        $validator = Validator::make($request->all(), [
            'userAnswers' => 'required|array',
            'userAnswers.*' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Respuestas inválidas',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Remover DB::beginTransaction() para MongoDB

            $intento = IntentosActividad::with('actividad.pasos')->find($intentoId);
            if (!$intento) {
                return response()->json([
                    'success' => false,
                    'message' => 'Intento no encontrado'
                ], 404);
            }

            if ($intento->gameCompleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Este intento ya fue completado'
                ], 400);
            }

            $userAnswers = $request->userAnswers;
            $correctSteps = $intento->actividad->pasos()->orderBy('orden_correcto')->get();

            // Validar que el número de respuestas coincida
            if (count($userAnswers) !== $correctSteps->count()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Número de respuestas no coincide con los pasos'
                ], 400);
            }

            // Eliminar respuestas anteriores de este intento
            RespuestaUsuario::where('intento_id', $intentoId)->delete();

            // Evaluar respuestas y guardar
            $correctAnswers = 0;
            $totalAnswers = count($userAnswers);
            $feedbackLines = [];

            foreach ($userAnswers as $index => $userAnswer) {
                $correctStep = $correctSteps[$index];
                $isCorrect = $this->compareAnswers($userAnswer, $correctStep->descripcion_paso);

                if ($isCorrect) {
                    $correctAnswers++;
                }

                // Guardar respuesta del usuario
                RespuestaUsuario::create([
                    'intento_id' => $intentoId,
                    'paso_orden' => $index + 1,
                    'userAnswer' => $userAnswer
                ]);

                // Crear línea de feedback
                $feedbackLines[] = $isCorrect
                    ? "Paso " . ($index + 1) . ": ✅ Correcto"
                    : "Paso " . ($index + 1) . ": ❌ Incorrecto (Correcto: " . $correctStep->descripcion_paso . ")";
            }

            // Calcular puntuación
            $score = ($correctAnswers / $totalAnswers) * 100;
            $feedback = implode("\n", $feedbackLines);

            // Mensaje de resultado (modificado para preview)
            $message = '';
            if ($intento->is_preview ?? false) {
                $message = 'Vista previa completada. Resultado: ' . round($score) . '% de aciertos.';
            } else {
                if ($score == 100) {
                    $message = '¡Excelente! Has completado la actividad perfectamente.';
                } elseif ($score >= 70) {
                    $message = '¡Buen trabajo! Has completado la mayoría de pasos correctamente.';
                } elseif ($score >= 50) {
                    $message = 'Buen intento. Revisa algunos pasos e inténtalo de nuevo.';
                } else {
                    $message = 'Necesitas practicar más. ¡No te rindas!';
                }
            }

            // Actualizar intento
            $intento->update([
                'gameCompleted' => true,
                'showFeedback' => true,
                'feedback' => $feedback,
                'message' => $message
            ]);

            // Remover DB::commit() para MongoDB

            return response()->json([
                'success' => true,
                'message' => 'Respuestas evaluadas exitosamente',
                'data' => [
                    'intento_id' => $intentoId,
                    'score' => $score,
                    'correct_answers' => $correctAnswers,
                    'total_answers' => $totalAnswers,
                    'feedback' => $feedback,
                    'message' => $message,
                    'game_completed' => true,
                    'is_preview' => $intento->is_preview ?? false
                ]
            ]);
        } catch (\Exception $e) {
            // Remover DB::rollback() para MongoDB
            return response()->json([
                'success' => false,
                'message' => 'Error al evaluar respuestas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener resultado de un intento
     */
    public function getAttemptResult($intentoId)
    {
        try {
            $intento = IntentosActividad::with([
                'actividad',
                'estudiante.usuario',
                'respuestasUsuario'
            ])->find($intentoId);

            if (!$intento) {
                return response()->json([
                    'success' => false,
                    'message' => 'Intento no encontrado'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $intento
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener resultado: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reiniciar un intento (crear uno nuevo)
     * Modificado para manejar preview mode
     */
    public function restartAttempt($intentoId)
    {
        try {
            $intentoAnterior = IntentosActividad::find($intentoId);
            if (!$intentoAnterior) {
                return response()->json([
                    'success' => false,
                    'message' => 'Intento no encontrado'
                ], 404);
            }

            // Crear nuevo intento manteniendo el tipo (preview o normal)
            $nuevoIntento = IntentosActividad::create([
                'actividad_id' => $intentoAnterior->actividad_id,
                'estudiante_id' => $intentoAnterior->estudiante_id,
                'docente_id' => $intentoAnterior->docente_id ?? null,
                'gameCompleted' => false,
                'showFeedback' => false,
                'feedback' => '',
                'message' => '',
                'is_preview' => $intentoAnterior->is_preview ?? false
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Nuevo intento creado exitosamente',
                'data' => [
                    'intento_id' => $nuevoIntento->id,
                    'actividad_id' => $nuevoIntento->actividad_id,
                    'is_preview' => $nuevoIntento->is_preview ?? false
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al reiniciar intento: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener historial de intentos de un estudiante
     * Modificado para excluir intentos de preview
     */
    public function getStudentHistory($estudianteId = null)
    {
        try {
            $user = Auth::user();

            if ($estudianteId) {
                $estudiante = Estudiante::find($estudianteId);
            } else {
                $estudiante = Estudiante::where('usuario_id', $user->id)->first();
            }

            if (!$estudiante) {
                return response()->json([
                    'success' => false,
                    'message' => 'Estudiante no encontrado'
                ], 404);
            }

            $intentos = IntentosActividad::with(['actividad', 'respuestasUsuario'])
                ->where('estudiante_id', $estudiante->id)
                ->where(function ($query) {
                    $query->where('is_preview', false)
                        ->orWhereNull('is_preview');
                })
                ->orderBy('created_at', 'desc')
                ->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $intentos
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener historial: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de un estudiante
     * Modificado para excluir intentos de preview
     */
    public function getStudentStats($estudianteId = null)
    {
        try {
            $user = Auth::user();

            if ($estudianteId) {
                $estudiante = Estudiante::find($estudianteId);
            } else {
                $estudiante = Estudiante::where('usuario_id', $user->id)->first();
            }

            if (!$estudiante) {
                return response()->json([
                    'success' => false,
                    'message' => 'Estudiante no encontrado'
                ], 404);
            }

            // Estadísticas generales (excluyendo previews)
            $totalIntentos = IntentosActividad::where('estudiante_id', $estudiante->id)
                ->where(function ($query) {
                    $query->where('is_preview', false)
                        ->orWhereNull('is_preview');
                })->count();

            $intentosCompletos = IntentosActividad::where('estudiante_id', $estudiante->id)
                ->where('gameCompleted', true)
                ->where(function ($query) {
                    $query->where('is_preview', false)
                        ->orWhereNull('is_preview');
                })->count();

            // actividads únicas jugadas (excluyendo previews)
            $actividadsJugadas = IntentosActividad::where('estudiante_id', $estudiante->id)
                ->where(function ($query) {
                    $query->where('is_preview', false)
                        ->orWhereNull('is_preview');
                })
                ->distinct('actividad_id')->count('actividad_id');

            // Estadísticas por dificultad (excluyendo previews)
            $statsPorDificultad = IntentosActividad::where('estudiante_id', $estudiante->id)
                ->where(function ($query) {
                    $query->where('is_preview', false)
                        ->orWhereNull('is_preview');
                })
                ->join('actividads', 'intentos_actividads.actividad_id', '=', 'actividads._id')
                ->selectRaw('actividads.difficulty, COUNT(*) as total, SUM(CASE WHEN gameCompleted = true THEN 1 ELSE 0 END) as completados')
                ->groupBy('actividads.difficulty')
                ->get();

            // Últimos intentos (excluyendo previews)
            $ultimosIntentos = IntentosActividad::with('actividad')
                ->where('estudiante_id', $estudiante->id)
                ->where(function ($query) {
                    $query->where('is_preview', false)
                        ->orWhereNull('is_preview');
                })
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();

            $stats = [
                'total_intentos' => $totalIntentos,
                'intentos_completos' => $intentosCompletos,
                'porcentaje_completado' => $totalIntentos > 0 ? round(($intentosCompletos / $totalIntentos) * 100, 2) : 0,
                'actividads_jugadas' => $actividadsJugadas,
                'stats_por_dificultad' => $statsPorDificultad,
                'ultimos_intentos' => $ultimosIntentos
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener actividads disponibles para jugar
     */
    public function getAvailableActivities(Request $request)
    {
        try {
            $query = Actividad::with(['docente.usuario', 'imagenes']);

            // Filtros opcionales
            if ($request->has('difficulty')) {
                $query->where('difficulty', $request->difficulty);
            }

            if ($request->has('ageGroup')) {
                $query->where('ageGroup', $request->ageGroup);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            }

            $actividads = $query->orderBy('created_at', 'desc')->paginate(12);

            return response()->json([
                'success' => true,
                'data' => $actividads
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener actividads: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Comparar respuestas del usuario con la correcta
     * Método auxiliar para evaluar respuestas
     */
    private function compareAnswers($userAnswer, $correctAnswer)
    {
        // Normalizar ambas respuestas
        $userNormalized = strtolower(trim($userAnswer));
        $correctNormalized = strtolower(trim($correctAnswer));

        // Comparación exacta
        if ($userNormalized === $correctNormalized) {
            return true;
        }

        // Comparación con similitud (opcional, para ser más flexible)
        $similarity = 0;
        similar_text($userNormalized, $correctNormalized, $similarity);

        // Consideramos correcto si hay más del 85% de similitud
        return $similarity >= 85;
    }

    /**
     * Obtener ranking de estudiantes
     * Modificado para excluir intentos de preview
     */
    public function getLeaderboard(Request $request)
    {
        try {
            $period = $request->get('period', 'all'); // all, month, week

            $query = IntentosActividad::selectRaw('
                estudiante_id,
                COUNT(*) as total_intentos,
                SUM(CASE WHEN gameCompleted = true THEN 1 ELSE 0 END) as intentos_exitosos,
                COUNT(DISTINCT actividad_id) as actividads_completadas,
                ROUND(AVG(CASE WHEN gameCompleted = true THEN 100 ELSE 0 END), 2) as promedio_exito
            ')
                ->with(['estudiante.usuario'])
                ->where(function ($query) {
                    $query->where('is_preview', false)
                        ->orWhereNull('is_preview');
                })
                ->groupBy('estudiante_id');

            // Filtro por período
            if ($period === 'month') {
                $query->where('created_at', '>=', now()->subMonth());
            } elseif ($period === 'week') {
                $query->where('created_at', '>=', now()->subWeek());
            }

            $ranking = $query->orderByDesc('intentos_exitosos')
                ->orderByDesc('actividads_completadas')
                ->orderByDesc('promedio_exito')
                ->limit(20)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $ranking
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener ranking: ' . $e->getMessage()
            ], 500);
        }
    }
}
