<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;

class AuthController extends Controller
{
    /**
     * Login y generación del token JWT
     */
    public function login(Request $request)
    {
        try {
            $credentials = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            if (! $token = Auth::attempt($credentials)) {
                return response()->json([
                    'message' => 'Credenciales incorrectas'
                ], 401);
            }

            return response()->json([
                'access_token' => $token,
                'token_type' => 'bearer',
                'expires_in' => Auth::factory()->getTTL() * 60,
                'user' => auth()->user()
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Error inesperado al iniciar sesión',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Registro de usuario (SIN login automático)
     */
    public function register(Request $request)
    {
        try {
            $data = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:6',
            ]);

            // IMPORTANTE: hashear contraseña
            $data['password'] = Hash::make($data['password']);

            $user = User::create($data);

            return response()->json([
                'message' => 'Usuario registrado correctamente',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ]
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Error inesperado al registrar el usuario',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Usuario autenticado
     */
    public function me()
    {
        try {
            $user = Auth::user();

            if (! $user) {
                return response()->json([
                    'message' => 'No autenticado'
                ], 401);
            }

            return response()->json($user);

        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Error al obtener el usuario autenticado',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Logout (invalida el token)
     */
    public function logout()
    {
        try {
            Auth::logout();

            return response()->json([
                'message' => 'Sesión cerrada correctamente'
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Error al cerrar sesión',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Refrescar token
     */
    public function refresh()
    {
        try {
            return $this->respondWithToken(Auth::refresh());

        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'No se pudo refrescar el token',
                'error' => $e->getMessage(),
            ], 401);
        }
    }

    /**
     * Respuesta estándar con token
     */
    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => Auth::factory()->getTTL() * 60
        ]);
    }
}
