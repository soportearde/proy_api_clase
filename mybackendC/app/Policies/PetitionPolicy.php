<?php

namespace App\Policies;

use App\Models\Petition;
use App\Models\User;

class PetitionPolicy
{
    public function viewAny(User $user): bool
    {
        return false;
    }

    public function view(User $user, Petition $petition): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Petition $petition): bool
    {
        // Solo puede editar si la petición es suya
        return $petition->user_id == $user->id;
    }

    public function delete(User $user, Petition $petition): bool
    {
        // Solo puede borrar si la petición es suya
        return $petition->user_id == $user->id;
    }

    public function restore(User $user, Petition $petition): bool
    {
        return true;
    }

    public function forceDelete(User $user, Petition $petition): bool
    {
        return false;
    }

    // El usuario puede firmar solo si NO es el creador
    public function sign(User $user, Petition $petition): bool
    {
        return $user->id != $petition->user_id;
    }
}