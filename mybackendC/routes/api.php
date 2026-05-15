<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PetitionController;
use App\Http\Controllers\AdminController;
use App\Models\Category;
use App\Models\File;

// Rutas públicas
Route::post('login',    [AuthController::class, 'login']);
Route::post('register', [AuthController::class, 'register']);
Route::get('categories', fn() => response()->json(Category::all()));

// Rutas públicas de peticiones (sin login)
Route::get('petitions',      [PetitionController::class, 'index']);
Route::get('petitions/{id}', [PetitionController::class, 'show']);

// Refresh token (no requiere auth estricto)
Route::middleware('api')->post('refresh', [AuthController::class, 'refresh']);

// Rutas protegidas (requieren token JWT válido)
Route::middleware('auth:api')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me',      [AuthController::class, 'me']);

    Route::get('mypetitions',             [PetitionController::class, 'mine']);
    Route::get('mysigns',                 [PetitionController::class, 'mySigns']);
    Route::post('petitions',              [PetitionController::class, 'store']);
    Route::put('petitions/sign/{id}',     [PetitionController::class, 'sign']);
    Route::put('petitions/{id}',          [PetitionController::class, 'update']);
    Route::delete('petitions/{id}',       [PetitionController::class, 'delete']);

    Route::delete('petition-files/{id}', function ($id) {
        $file = File::findOrFail($id);
        // Verificar que la petición pertenece al usuario autenticado
        if ($file->petition->user_id !== auth()->id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        \Illuminate\Support\Facades\Storage::disk('public')->delete($file->file_path);
        $file->delete();
        return response()->json(['message' => 'Imagen eliminada']);
    });
});

// ----------------------------------------------------
// RUTAS DE ADMINISTRADOR
// Protegidas por auth:api Y is_admin
// ----------------------------------------------------
Route::middleware(['auth:api', 'is_admin'])->prefix('admin')->group(function () {
    // Peticiones
    Route::get('/peticiones',           [AdminController::class, 'indexPeticiones']);
    Route::get('/peticiones/{id}',      [AdminController::class, 'showPeticion']);
    Route::post('/peticiones/{id}',     [AdminController::class, 'updatePeticion']); // POST + _method=PUT para multipart
    Route::put('/peticiones/{id}',      [AdminController::class, 'updatePeticion']);
    Route::delete('/peticiones/{id}',   [AdminController::class, 'destroyPeticion']);

    // Usuarios (se completan en Parte 2)
    Route::get('/users',          [\App\Http\Controllers\AdminUsersController::class, 'getUsers']);
    Route::get('/users/{id}',     [\App\Http\Controllers\AdminUsersController::class, 'showUser']);
    Route::put('/users/{id}',     [\App\Http\Controllers\AdminUsersController::class, 'updateUser']);
    Route::delete('/users/{id}',  [\App\Http\Controllers\AdminUsersController::class, 'destroyUser']);
});
