<?php

namespace App\Http\Middleware;

use Closure;
use Exception;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Http\Middleware\BaseMiddleware;

class JwtMiddleware extends BaseMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        try {
            // Verifica si hay un token válido
            $user = JWTAuth::parseToken()->authenticate();

            // ✅ Forma compatible de establecer el usuario autenticado
            $request->setUserResolver(function () use ($user) {
                return $user;
            });

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
