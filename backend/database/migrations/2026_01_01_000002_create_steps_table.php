<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('itinerary_id')->constrained()->onDelete('cascade');
            $table->string('nom');
            $table->text('notes')->nullable();
            $table->dateTime('date_etape')->nullable();
            $table->integer('ordre')->default(0);
            $table->boolean('est_obligatoire')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('steps');
    }
};