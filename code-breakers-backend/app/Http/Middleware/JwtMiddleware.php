<?php

namespace App\Http\Middleware;

use Closure;
use Exception;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class JwtMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        try {
            // Intentar autenticar al usuario desde el token
            $user = JWTAuth::parseToken()->authenticate();

            // Establece el usuario autenticado manualmente
            $request->setUserResolver(fn () => $user);

        } catch (Exception $e) {
            if ($e instanceof \Tymon\JWTAuth\Exceptions\TokenInvalidException) {
                return response()->json(['message' => 'Token inválido'], 401);
            } elseif ($e instanceof \Tymon\JWTAuth\Exceptions\TokenExpiredException) {
                return response()->json(['message' => 'Token expirado'], 401);
            } else {
                return response()->json(['message' => 'Token no encontrado'], 401);
            }
        }

        return $next($request);
    }
}
