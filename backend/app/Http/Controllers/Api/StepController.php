<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Itinerary;
use App\Models\Step;
use App\Services\StepService;
use DomainException;
use Illuminate\Http\Request;

class StepController extends Controller
{
    public function __construct(private readonly StepService $stepService)
    {
    }

    private function authorizeItineraryOwner(Request $request, int $itineraryId): void
    {
        $itinerary = Itinerary::findOrFail($itineraryId);
        abort_unless((int) $itinerary->user_id === (int) $request->user()->id, 403, 'Accès interdit à cet itinéraire.');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'itinerary_id' => 'required|integer|exists:itineraries,id',
            'nom' => 'required|string|max:255',
            'notes' => 'nullable|string|max:2000',
            'date_etape' => 'nullable|date',
            'ordre' => 'nullable|integer|min:1',
            'est_obligatoire' => 'nullable|boolean',
        ]);

        $this->authorizeItineraryOwner($request, (int) $validated['itinerary_id']);

        $step = $this->stepService->createStep($validated);

        return response()->json($step, 201);
    }

    public function update(Request $request, Step $step)
    {
        $this->authorizeItineraryOwner($request, (int) $step->itinerary_id);

        $validated = $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'notes' => 'nullable|string|max:2000',
            'date_etape' => 'nullable|date',
            'ordre' => 'sometimes|integer|min:1',
            'est_obligatoire' => 'sometimes|boolean',
        ]);

        $updated = $this->stepService->updateStep($step, $validated);

        return response()->json($updated, 200);
    }

    public function destroy(Request $request, Step $step)
    {
        $this->authorizeItineraryOwner($request, (int) $step->itinerary_id);

        try {
            $this->stepService->deleteStep($step);

            return response()->json(null, 204);
        } catch (DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}