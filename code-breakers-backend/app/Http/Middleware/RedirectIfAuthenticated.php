<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RedirectIfAuthenticated
{
    public function handle(Request $request, Closure $next, ...$guards)
    {
        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                // Para apps API no necesitas redirigir, simplemente retornas error
                return response()->json(['message' => 'Ya estás autenticado'], 403);
            }
        }

        return $next($request);
    }
}
