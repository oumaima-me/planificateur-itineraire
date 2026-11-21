<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Itinerary;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ItineraryController extends Controller
{
    public function index(Request $request)
    {
        $today = Carbon::today()->toDateString();

        $query = Itinerary::with('steps.activities');

        if ($request->user()) {
            $query->where('user_id', $request->user()->id);
        }

        $itineraries = $query->get()
            ->sortBy(function ($itinerary) use ($today) {
                $refDate = $itinerary->date_debut
                    ? Carbon::parse($itinerary->date_debut)->toDateString()
                    : ($itinerary->date_fin ? Carbon::parse($itinerary->date_fin)->toDateString() : null);

                $isFuture = ! $refDate || $refDate >= $today;
                $group = $isFuture ? 0 : 1; // 0 = futurs en premier, 1 = passés ensuite

                $timestamp = $refDate ? Carbon::parse($refDate)->timestamp : PHP_INT_MAX;
                $sortKey = $group === 0 ? $timestamp : -$timestamp;

                return sprintf('%d-%020d', $group, $sortKey + 100000000000);
            })
            ->values();

        return response()->json($itineraries, 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'destination' => 'required|string|max:255',
            'date_debut' => 'nullable|date',
            'date_fin' => 'nullable|date',
            'budget' => 'nullable|numeric',
        ]);

        $validated['user_id'] = $request->user()?->id ?? $validated['user_id'] ?? null;

        if (! $validated['user_id']) {
            return response()->json(['message' => 'Utilisateur requis.'], 422);
        }

        $itinerary = Itinerary::create($validated);

        // Création automatique de l'étape obligatoire par défaut
        $defaultStep = $itinerary->steps()->create([
            'nom' => 'Étape obligatoire : ' . $itinerary->destination,
            'notes' => 'Étape par défaut obligatoire',
            'date_etape' => $itinerary->date_debut,
            'ordre' => 1,
            'est_obligatoire' => true,
        ]);

        // Activité par défaut liée à l'étape obligatoire
        $defaultStep->activities()->create([
            'nom' => 'Arrivée et installation',
            'notes' => 'Activité par défaut',
            'cout' => 0,
            'est_obligatoire' => true,
            'ordre' => 1,
        ]);

        return response()->json($itinerary->load('steps.activities'), 201);
    }

    public function show(Itinerary $itinerary)
    {
        return response()->json($itinerary->load('steps.activities'), 200);
    }

    public function update(Request $request, Itinerary $itinerary)
    {
        $validated = $request->validate([
            'titre' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'destination' => 'sometimes|string|max:255',
            'date_debut' => 'nullable|date',
            'date_fin' => 'nullable|date',
            'budget' => 'nullable|numeric',
        ]);

        $itinerary->update($validated);

        return response()->json($itinerary->load('steps.activities'), 200);
    }

    public function destroy(Itinerary $itinerary)
    {
        $itinerary->delete();

        return response()->json(null, 204);
    }
}