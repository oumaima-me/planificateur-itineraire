<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Step;
use App\Services\StepService;
use DomainException;
use Illuminate\Http\Request;

class StepController extends Controller
{
    public function __construct(private readonly StepService $stepService)
    {
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'itinerary_id' => 'required|exists:itineraries,id',
            'nom' => 'required|string|max:255',
            'notes' => 'nullable|string',
            'date_etape' => 'nullable|date',
            'ordre' => 'nullable|integer|min:1',
            'est_obligatoire' => 'nullable|boolean',
        ]);

        $step = $this->stepService->createStep($validated);

        return response()->json($step, 201);
    }

    public function update(Request $request, Step $step)
    {
        $validated = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'notes' => 'nullable|string',
            'date_etape' => 'nullable|date',
            'ordre' => 'sometimes|integer|min:1',
            'est_obligatoire' => 'sometimes|boolean',
        ]);

        $updated = $this->stepService->updateStep($step, $validated);

        return response()->json($updated, 200);
    }

    public function destroy(Step $step)
    {
        try {
            $this->stepService->deleteStep($step);
            return response()->json(null, 204);
        } catch (DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}