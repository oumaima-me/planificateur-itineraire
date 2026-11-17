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
        Schema::create('steps', function (Blueprint $table) {
        $table->id();
        $table->foreignId('itinerary_id')->constrained()->onDelete('cascade'); // Lien avec l'itinéraire parent
        $table->string('nom'); // Nom de l'étape (ex: Visite du musée, Hôtel...)
        $table->text('notes')->nullable(); // Notes ou informations pratiques
        $table->dateTime('date_etape')->nullable(); // Date et heure de l'étape
        $table->integer('ordre')->default(0); // Pour trier l'ordre des étapes dans l'itinéraire
        $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('steps');
    }
};
