<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Category;
use App\Models\User;

class Petition extends Model
{
    protected $table = 'petitions';

    protected $fillable = [
        'title',
        'description',
        'destinatary',
        'signeds',
        'status',
        'user_id',
        'category_id'
    ];

    // Una petición pertenece a una categoría

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
    public function files()
    {
        return $this->hasMany(File::class, 'petition_id');
    }



    public function signs()
    {
        return $this->belongsToMany(User::class, 'petition_user', 'petition_id', 'user_id')->withTimestamps();
    }
}