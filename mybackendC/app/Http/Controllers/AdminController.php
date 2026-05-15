<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Petition;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    /**
     * Mapea una petición Eloquent al formato que esperan los PDFs
     * (titulo, descripcion, destinatario, categoria, firmas_count, etc.)
     */
    private function mapPetition(Petition $p): array
    {
        return [
            'id' => $p->id,
            'titulo' => $p->title,
            'descripcion' => $p->description,
            'destinatario' => $p->destinatary,
            'estado' => $p->status,
            'firmantes' => $p->signeds,
            'firmas_count' => $p->signs_count ?? $p->signeds ?? 0,
            'user_id' => $p->user_id,
            'categoria_id' => $p->category_id,
            'created_at' => $p->created_at,
            'updated_at' => $p->updated_at,
            'user' => $p->user ? [
                'id' => $p->user->id,
                'name' => $p->user->name,
                'email' => $p->user->email,
            ] : null,
            'categoria' => $p->category ? [
                'id' => $p->category->id,
                'nombre' => $p->category->name,
            ] : null,
            'files' => $p->files,
        ];
    }

    // 1. Listar todas las peticiones para el panel
    public function indexPeticiones()
    {
        $peticiones = Petition::with(['category', 'user', 'files'])
            ->withCount('signs')
            ->orderBy('created_at', 'desc')
            ->get();

        $data = $peticiones->map(fn(Petition $p) => $this->mapPetition($p));

        return response()->json([
            'success' => true,
            'data' => $data,
        ], 200);
    }

    // 2. Mostrar una petición (Admin)
    public function showPeticion($id)
    {
        $petition = Petition::with(['category', 'user', 'files'])
            ->withCount('signs')
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $this->mapPetition($petition),
        ], 200);
    }

    // 3. Actualizar una petición (Admin) — acepta multipart con _method=PUT
    public function updatePeticion(Request $request, $id)
    {
        $petition = Petition::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'titulo'        => 'required|max:255',
            'descripcion'   => 'required',
            'destinatario'  => 'required',
            'categoria_id'  => 'required|exists:categories,id',
            'estado'        => 'nullable|string',
            'file'          => 'nullable|file|mimes:jpeg,png,jpg,gif,svg|max:4096',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $petition->update([
            'title'        => $request->titulo,
            'description'  => $request->descripcion,
            'destinatary'  => $request->destinatario,
            'category_id'  => $request->categoria_id,
            'status'       => $request->estado ?? $petition->status,
        ]);

        if ($file = $request->file('file')) {
            $path = $file->store('petitions', 'public');
            $petition->files()->create([
                'name' => $file->getClientOriginalName(),
                'file_path' => $path,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Petición actualizada correctamente por el administrador.',
            'data'    => $this->mapPetition($petition->fresh(['category','user','files'])),
        ], 200);
    }

    // 4. Eliminar cualquier petición a la fuerza
    public function destroyPeticion($id)
    {
        $petition = Petition::findOrFail($id);

        foreach ($petition->files as $file) {
            Storage::disk('public')->delete($file->file_path);
            $file->delete();
        }

        $petition->delete();

        return response()->json([
            'success' => true,
            'message' => 'Petición eliminada correctamente por el administrador.'
        ], 200);
    }
}
