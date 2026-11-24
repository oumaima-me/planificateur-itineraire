<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Step;
use App\Services\ActivityService;
use DomainException;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    public function __construct(private readonly ActivityService $activityService)
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
            'notes' => 'nullable|string|max:2000',
            'cout' => 'nullable|numeric|min:0',
            'est_obligatoire' => 'nullable|boolean',
            'ordre' => 'nullable|integer|min:1',
        ]);

        $this->authorizeStepOwner($request, (int) $validated['step_id']);

        $activity = $this->activityService->createActivity($validated);

        return response()->json($activity, 201);
    }

    public function update(Request $request, Activity $activity)
    {
        $this->authorizeStepOwner($request, (int) $activity->step_id);

        $validated = $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'notes' => 'nullable|string|max:2000',
            'cout' => 'sometimes|numeric|min:0',
            'est_obligatoire' => 'sometimes|boolean',
            'ordre' => 'sometimes|integer|min:1',
        ]);

        $updated = $this->activityService->updateActivity($activity, $validated);

        return response()->json($updated, 200);
    }

    public function destroy(Request $request, Activity $activity)
    {
        $this->authorizeStepOwner($request, (int) $activity->step_id);

        try {
            $this->activityService->deleteActivity($activity);

            return response()->json(null, 204);
        } catch (DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}