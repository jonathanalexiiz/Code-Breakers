<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MongoUser;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    // Registro de usuario
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'role'     => 'nullable|in:docente,estudiante',
        ]);

        $user = MongoUser::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'role'     => $request->role ?? 'estudiante', // Valor por defecto si no se envía
            'password' => Hash::make($request->password),
        ]);

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => '✅ Usuario registrado correctamente',
            'token'   => $token,
        ]);
    }

    // Login de usuario
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $credentials = $request->only('email', 'password');

        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json(['error' => '❌ Credenciales incorrectas'], 401);
        }

        return response()->json([
            'message' => '🔓 Login exitoso',
            'token'   => $token,
        ]);
    }

    // Ver perfil (requiere token válido)
    public function profile()
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            return response()->json($user);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Token inválido o expirado'], 401);
        }
    }

    // Logout (invalida el token actual)
    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
            return response()->json(['message' => '🚪 Sesión cerrada']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Token inválido o ya expirado'], 401);
        }
    }

    // Cambiar contraseña del usuario autenticado
    public function changePassword(Request $request)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();

            $request->validate([
                'new_password' => 'required|string|min:6|confirmed',
            ]);

            $user->password = Hash::make($request->new_password);
            $user->save();

            return response()->json(['message' => '🔒 Contraseña actualizada correctamente']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Token inválido o expirado'], 401);
        }
    }
}
