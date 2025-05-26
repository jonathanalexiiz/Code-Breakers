<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Authentication Defaults
    |--------------------------------------------------------------------------
    |
    | Este bloque define el guard y el proveedor por defecto.
    | En este caso usamos 'api' con JWT para autenticación por token.
    */

    'defaults' => [
        'guard' => 'api',
        'passwords' => 'users',
    ],

    /*
    |--------------------------------------------------------------------------
    | Authentication Guards
    |--------------------------------------------------------------------------
    |
    | Aqui definimos los guards para distintos mecanismos de autenticación.
    | El guard 'api' usará JWT y se conectará con el proveedor 'users'.
    */

    'guards' => [
        'web' => [
            'driver' => 'session', // Para el sistema tradicional de Laravel
            'provider' => 'users',
        ],

        'api' => [
            'driver' => 'jwt', // ✅ JWT driver para API
            'provider' => 'users',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | User Providers
    |--------------------------------------------------------------------------
    |
    | Se define cómo se obtienen los usuarios.
    | Usamos Eloquent y especificamos el modelo MongoUser, que apunta a MongoDB.
    */

    'providers' => [
        'users' => [
            'driver' => 'eloquent',
            'model' => App\Models\MongoUser::class,
        ],

        // Alternativa con base de datos (no usada aquí):
        // 'users' => [
        //     'driver' => 'database',
        //     'table' => 'users',
        // ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Resetting Passwords
    |--------------------------------------------------------------------------
    |
    | Configuración para restablecer contraseñas.
    | Aunque no se está usando en el sistema JWT actual, se deja definido.
    */

    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table' => env('AUTH_PASSWORD_RESET_TOKEN_TABLE', 'password_reset_tokens'),
            'expire' => 60,
            'throttle' => 60,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Password Confirmation Timeout
    |--------------------------------------------------------------------------
    |
    | Define el tiempo de expiración para la confirmación de contraseña.
    | Valor por defecto: 3 horas (10800 segundos).
    */

    'password_timeout' => env('AUTH_PASSWORD_TIMEOUT', 10800),

];
