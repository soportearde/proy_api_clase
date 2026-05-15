<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Petition;

class Category extends Model
{
    protected $table = 'categories';

    // Campos que se pueden rellenar masivamente
    protected $fillable = ['name'];

    // Relación: una categoría tiene muchas peticiones
    public function petitions()
    {
        return $this->hasMany(Petition::class);
    }
}