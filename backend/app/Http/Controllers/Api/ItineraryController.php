<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Itinerary;
use App\Services\ItineraryService;
use Illuminate\Http\Request;

class ItineraryController extends Controller
{
    public function __construct(private readonly ItineraryService $itineraryService)
    {
    }

    public function index(Request $request)
    {
        $validatedDates = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $itineraries = $this->itineraryService->listForUser(
            $request->user()?->id,
            $validatedDates['start_date'] ?? null,
            $validatedDates['end_date'] ?? null
        );

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

        $userId = $request->user()?->id ?? $validated['user_id'] ?? null;

        if (! $userId) {
            return response()->json(['message' => 'Utilisateur requis.'], 422);
        }

        $itinerary = $this->itineraryService->createWithDefaults($validated, (int) $userId);

        return response()->json($itinerary, 201);
    }

    public function show(Itinerary $itinerary)
    {
        $details = $this->itineraryService->getDetails($itinerary);

        return response()->json($details, 200);
    }

    public function summary(Itinerary $itinerary)
    {
        $summary = $this->itineraryService->getSummary($itinerary);

        return response()->json($summary, 200);
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

        $updated = $this->itineraryService->updateItinerary($itinerary, $validated);

        return response()->json($updated, 200);
    }

    public function destroy(Itinerary $itinerary)
    {
        $this->itineraryService->deleteItinerary($itinerary);

        return response()->json(null, 204);
    }
}