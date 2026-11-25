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

    private function authorizeOwner(Request $request, Itinerary $itinerary): void
    {
        abort_unless((int) $itinerary->user_id === (int) $request->user()->id, 403, 'Accès interdit à cet itinéraire.');
    }

    public function index(Request $request)
    {
        $validatedDates = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $itineraries = $this->itineraryService->listForUser(
            (int) $request->user()->id,
            $validatedDates['start_date'] ?? null,
            $validatedDates['end_date'] ?? null
        );

        return response()->json($itineraries, 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'destination' => 'required|string|max:255',
            'date_debut' => 'nullable|date',
            'date_fin' => 'nullable|date|after_or_equal:date_debut',
            'budget' => 'nullable|numeric|min:0',
        ]);

        $itinerary = $this->itineraryService->createWithDefaults($validated, (int) $request->user()->id);

        return response()->json($itinerary, 201);
    }

    public function show(Request $request, Itinerary $itinerary)
    {
        $this->authorizeOwner($request, $itinerary);

        $details = $this->itineraryService->getDetails($itinerary);

        return response()->json($details, 200);
    }

    public function summary(Request $request, Itinerary $itinerary)
    {
        $this->authorizeOwner($request, $itinerary);

        $summary = $this->itineraryService->getSummary($itinerary);

        return response()->json($summary, 200);
    }

    public function update(Request $request, Itinerary $itinerary)
    {
        $this->authorizeOwner($request, $itinerary);

        $validated = $request->validate([
            'titre' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'destination' => 'sometimes|required|string|max:255',
            'date_debut' => 'nullable|date',
            'date_fin' => 'nullable|date|after_or_equal:date_debut',
            'budget' => 'nullable|numeric|min:0',
        ]);

        if (array_key_exists('budget', $validated) && $validated['budget'] === null) {
            $validated['budget'] = 0;
        }

        $updated = $this->itineraryService->updateItinerary($itinerary, $validated);

        return response()->json($updated, 200);
    }

    public function destroy(Request $request, Itinerary $itinerary)
    {
        $this->authorizeOwner($request, $itinerary);

        $this->itineraryService->deleteItinerary($itinerary);

        return response()->json(null, 204);
    }
}