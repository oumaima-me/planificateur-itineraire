<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('itineraries', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Lien avec l'utilisateur
        $table->string('titre'); // Titre de l'itinéraire
        $table->text('description')->nullable(); // Description détaillée
        $table->string('destination'); // Destination principale
        $table->date('date_debut')->nullable(); // Date de début
        $table->date('date_fin')->nullable(); // Date de fin
        $table->decimal('budget', 10, 2)->nullable(); // Budget prévu (pour les alertes de dépassement)
        $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('itineraries');
    }
};
