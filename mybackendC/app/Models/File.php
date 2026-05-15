<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Petition;

class File extends Model
{
    protected $fillable = [
        'name', 'file_path', 'petition_id'
    ];

    // Cada archivo pertenece a una petición
    public function petition()
    {
        return $this->belongsTo(Petition::class);
    }
}