<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Services\ActivityService;
use DomainException;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    public function __construct(private readonly ActivityService $activityService)
    {
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'step_id' => 'required|exists:steps,id',
            'nom' => 'required|string|max:255',
            'notes' => 'nullable|string',
            'cout' => 'nullable|numeric|min:0',
            'est_obligatoire' => 'nullable|boolean',
            'ordre' => 'nullable|integer|min:1',
        ]);

        $activity = $this->activityService->createActivity($validated);

        return response()->json($activity, 201);
    }

    public function update(Request $request, Activity $activity)
    {
        $validated = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'notes' => 'nullable|string',
            'cout' => 'sometimes|numeric|min:0',
            'est_obligatoire' => 'sometimes|boolean',
            'ordre' => 'sometimes|integer|min:1',
        ]);

        $updated = $this->activityService->updateActivity($activity, $validated);

        return response()->json($updated, 200);
    }

    public function destroy(Activity $activity)
    {
        try {
            $this->activityService->deleteActivity($activity);
            return response()->json(null, 204);
        } catch (DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}