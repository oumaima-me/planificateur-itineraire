<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Accommodation;
use App\Models\Step;
use App\Services\AccommodationService;
use Illuminate\Http\Request;

class AccommodationController extends Controller
{
    public function __construct(private readonly AccommodationService $accommodationService)
    {
    }

    private function authorizeStepOwner(Request $request, int $stepId): void
    {
        $step = Step::with('itinerary')->findOrFail($stepId);
        abort_unless(
            $step->itinerary && (int) $step->itinerary->user_id === (int) $request->user()->id,
            403,
            'Accès interdit à cette étape.'
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'step_id' => 'required|integer|exists:steps,id',
            'nom' => 'required|string|max:255',
            'prix_par_nuit' => 'required|numeric|min:0',
            'nombre_nuits' => 'required|integer|min:1',
        ]);

        $this->authorizeStepOwner($request, (int) $validated['step_id']);

        $accommodation = $this->accommodationService->createAccommodation($validated);

        return response()->json($accommodation, 201);
    }

    public function update(Request $request, Accommodation $accommodation)
    {
        $this->authorizeStepOwner($request, (int) $accommodation->step_id);

        $validated = $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'prix_par_nuit' => 'sometimes|numeric|min:0',
            'nombre_nuits' => 'sometimes|integer|min:1',
        ]);

        $updated = $this->accommodationService->updateAccommodation($accommodation, $validated);

        return response()->json($updated, 200);
    }

    public function destroy(Request $request, Accommodation $accommodation)
    {
        $this->authorizeStepOwner($request, (int) $accommodation->step_id);

        $this->accommodationService->deleteAccommodation($accommodation);

        return response()->json(null, 204);
    }
}