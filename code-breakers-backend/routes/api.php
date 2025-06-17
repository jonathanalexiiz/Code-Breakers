<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\AuthController;

// Rutas públicas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

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
});

