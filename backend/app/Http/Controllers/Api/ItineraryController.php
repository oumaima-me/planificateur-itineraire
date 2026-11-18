<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Itinerary;
use Illuminate\Http\Request;

class ItineraryController extends Controller
{
    public function index()
    {
        return response()->json(Itinerary::with('steps')->get(), 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'destination' => 'required|string|max:255',
            'date_debut' => 'nullable|date',
            'date_fin' => 'nullable|date',
            'budget' => 'nullable|numeric',
        ]);

        $itinerary = Itinerary::create($validated);
        return response()->json($itinerary, 201);
    }

    public function show(Itinerary $itinerary)
    {
        return response()->json($itinerary->load('steps'), 200);
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
        return response()->json($itinerary, 200);
    }

    public function destroy(Itinerary $itinerary)
    {
        $itinerary->delete();
        return response()->json(null, 204);
    }
}