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

// Prueba de conexión a MongoDB
Route::get('/test-mongodb', function () {
    try {
        $users = DB::connection('mongodb')->table('users')->limit(5)->get();
        return response()->json([
            'success' => true,
            'source' => 'MongoDB',
            'data' => $users,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => '❌ Error de conexión con MongoDB',
            'error' => $e->getMessage(),
        ], 500);
    }
});

// lsPrueba de conexión a MySQL
Route::get('/test-mysql', function () {
    try {
        $tables = DB::connection('mysql')->select('SHOW TABLES');
        return response()->json([
            'success' => true,
            'source' => 'MySQL',
            'tables' => $tables,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => '❌ Error de conexión con MySQL',
            'error' => $e->getMessage(),
        ], 500);
    }
});
