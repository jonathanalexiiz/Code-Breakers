<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ActividadController;
use App\Http\Controllers\JuegoController;

// Rutas públicas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/actividades/filtros', [ActividadController::class, 'getByFilters']);
Route::get('/juego/actividades', [JuegoController::class, 'getAvailableActivities']);
Route::get('/juego/actividades/{id}', [JuegoController::class, 'getGameActivity']);
Route::get('/juego/ranking', [JuegoController::class, 'getLeaderboard']);

// Rutas protegidas con JWT usando clase directamente
Route::middleware(['jwt.verify'])->group(function () {
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // Ruta protegida de prueba con JWT
    Route::get('/ping-protegido', function () {
        return response()->json([
            'message' => '🔐 Token válido, acceso permitido'
        ]);
    });

    // ==== ACTIVIDADES ====
    Route::get('/actividades', [ActividadController::class, 'index']);
    Route::get('/actividades/{id}', [ActividadController::class, 'show']);
    Route::post('/actividades', [ActividadController::class, 'store']);
    Route::put('/actividades/{id}', [ActividadController::class, 'update']);
    Route::delete('/actividades/{id}', [ActividadController::class, 'destroy']);
    Route::post('/actividades/validate', [ActividadController::class, 'validateActivity']);

    // ==== JUEGO ====
    Route::post('/juego/actividades/{actividadId}/intentos', [JuegoController::class, 'startAttempt']);
    Route::post('/juego/intentos/{intentoId}/respuestas', [JuegoController::class, 'submitAnswers']);
    Route::get('/juego/intentos/{intentoId}/resultado', [JuegoController::class, 'getAttemptResult']);
    Route::post('/juego/intentos/{intentoId}/reiniciar', [JuegoController::class, 'restartAttempt']);
    Route::get('/juego/historial', [JuegoController::class, 'getStudentHistory']);
    Route::get('/juego/historial/{estudianteId}', [JuegoController::class, 'getStudentHistory']);
    Route::get('/juego/estadisticas', [JuegoController::class, 'getStudentStats']);
    Route::get('/juego/estadisticas/{estudianteId}', [JuegoController::class, 'getStudentStats']);
    
    // Ruta adicional para vista previa de docentes (basada en el método startAttempt con preview_mode)
    Route::post('/juego/preview/{actividadId}', function($actividadId) {
        return app(JuegoController::class)->startAttempt(
            request()->merge(['preview_mode' => true]), 
            $actividadId
        );
    });
});
