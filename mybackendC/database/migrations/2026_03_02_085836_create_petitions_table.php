<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petitions', function (Blueprint $table) {
            $table->id();

            // Nombre correcto del campo
            $table->string('title', 255);

            $table->text('description');
            $table->text('destinatary')->nullable(); // opcional por si no lo usas

            // Número de firmas (inicial 0)
            $table->integer('signeds')->default(0);

            // Estado de la petición
            $table->enum('status', ['accepted', 'pending'])->default('pending');

            // Relaciones correctas
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petitions');
    }
};