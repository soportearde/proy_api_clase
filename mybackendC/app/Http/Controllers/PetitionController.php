<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Petition;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class PetitionController extends Controller
{
    /* ==========================================
       Métodos auxiliares de respuesta estándar
    ===========================================*/

    private function sendResponse($data, $message, $code = 200)
    {
        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => $message
        ], $code);
    }

    private function sendError($message, $errors = [], $code = 404)
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if (!empty($errors)) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }

    /* ==========================================
       GET /petitions
    ===========================================*/
    public function index()
    {
        try {
            $petitions = Petition::with(['user','category','files'])
                ->orderBy('created_at', 'desc')
                ->get();

            return $this->sendResponse($petitions, 'Petitions retrieved successfully');

        } catch (\Throwable $e) {
            return $this->sendError('Error retrieving petitions', $e->getMessage(), 500);
        }
    }

    /* ==========================================
       GET /petitions/{id}
    ===========================================*/
    public function show($id)
    {
        try {
            $petition = Petition::with(['user','category','files'])->findOrFail($id);

            return $this->sendResponse($petition, 'Petition found');

        } catch (\Throwable $e) {
            return $this->sendError('Petition not found', [], 404);
        }
    }

    /* ==========================================
       GET /my-petitions (auth required)
    ===========================================*/
    public function mine()
    {
        try {
            $petitions = Petition::where('user_id', Auth::id())
                ->with(['category','files'])
                ->orderBy('created_at','desc')
                ->paginate(6);

            return $this->sendResponse($petitions, 'Your petitions retrieved successfully');

        } catch (\Throwable $e) {
            return $this->sendError('Error retrieving your petitions', $e->getMessage(), 500);
        }
    }

    /* ==========================================
       GET /mysigns (auth required)
       Devuelve las peticiones que el usuario ha firmado.
    ===========================================*/
    public function mySigns()
    {
        try {
            $user = Auth::user();

            $petitions = $user->signatures()
                ->with(['user','category','files'])
                ->orderBy('petitions.created_at','desc')
                ->paginate(6);

            return $this->sendResponse($petitions, 'Your signed petitions retrieved successfully');

        } catch (\Throwable $e) {
            return $this->sendError('Error retrieving your signed petitions', $e->getMessage(), 500);
        }
    }

    /* ==========================================
       POST /petitions
    ===========================================*/
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|max:255',
            'description' => 'required',
            'destinatary' => 'required',
            'category' => 'required|exists:categories,id',
            'files' => 'required|array|min:1',
            'files.*' => 'file|mimes:jpeg,png,jpg,gif,svg|max:4096',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation error', $validator->errors(), 422);
        }

        try {
            $category = Category::findOrFail($request->category);

            $petition = new Petition();
            $petition->title = $request->title;
            $petition->description = $request->description;
            $petition->destinatary = $request->destinatary;
            $petition->user_id = Auth::id();
            $petition->category_id = $category->id;
            $petition->signeds = 0;
            $petition->status = 'pending';
            $petition->save();

            // Guardar archivos en storage
            foreach ($request->file('files') as $file) {
                $path = $file->store('petitions', 'public');
                $petition->files()->create([
                    'name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                ]);
            }

            return $this->sendResponse(
                $petition->load('files'),
                'Petition created successfully',
                201
            );

        } catch (\Throwable $e) {
            return $this->sendError('Error creating petition', $e->getMessage(), 500);
        }
    }

    /* ==========================================
       PUT /petitions/{id}
    ===========================================*/
    public function update(Request $request, $id)
    {
        try {
            $petition = Petition::findOrFail($id);

            if ($request->user()->cannot('update', $petition)) {
                return $this->sendError('Forbidden', [], 403);
            }

            $validator = Validator::make($request->all(), [
                'title' => 'required|max:255',
                'description' => 'required',
                'destinatary' => 'required',
                'category' => 'required|exists:categories,id',
                'file' => 'nullable|file|mimes:jpeg,png,jpg,gif,svg|max:4096',
            ]);

            if ($validator->fails()) {
                return $this->sendError('Validation error', $validator->errors(), 422);
            }

            $petition->update([
                'title' => $request->title,
                'description' => $request->description,
                'destinatary' => $request->destinatary,
                'category_id' => $request->category,
            ]);

            if ($file = $request->file('file')) {
                $path = $file->store('petitions', 'public');

                $petition->files()->create([
                    'name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                ]);
            }

            return $this->sendResponse($petition->load(['user','category','files']), 'Petition updated successfully');

        } catch (\Throwable $e) {
            return $this->sendError('Error updating petition', $e->getMessage(), 500);
        }
    }

    /* ==========================================
       DELETE /petitions/{id}
    ===========================================*/
    public function delete(Request $request, $id)
    {
        try {
            $petition = Petition::findOrFail($id);

            if ($request->user()->cannot('delete', $petition)) {
                return $this->sendError('Forbidden', [], 403);
            }

            foreach ($petition->files as $file) {
                Storage::disk('public')->delete($file->file_path);
                $file->delete();
            }

            $petition->delete();

            return $this->sendResponse(null, 'Petition deleted successfully');

        } catch (\Throwable $e) {
            return $this->sendError('Error deleting petition', $e->getMessage(), 500);
        }
    }

    /* ==========================================
       PUT /petitions/sign/{id}
    ===========================================*/
 public function sign(Request $request, $id)
{
    try {
        $petition = Petition::findOrFail($id);
        $user = Auth::user();

        // Comprueba la policy: el creador no puede firmar su propia petición
        if ($request->user()->cannot('sign', $petition)) {
            return $this->sendError('You cannot sign your own petition', [], 403);
        }

        // Comprueba si ya firmó antes
        if ($petition->signs()->where('user_id', $user->id)->exists()) {
            return $this->sendError('You already signed this petition', [], 403);
        }

        $petition->signs()->attach($user->id);
        $petition->increment('signeds');

        return $this->sendResponse($petition, 'Petition signed successfully', 201);

    } catch (\Throwable $e) {
        return $this->sendError('Error signing petition', $e->getMessage(), 500);
    }
} 
}