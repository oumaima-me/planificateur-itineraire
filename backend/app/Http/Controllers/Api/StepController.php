<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Step;
use Illuminate\Http\Request;

class StepController extends Controller
{
    public function index()
    {
        return response()->json(Step::with('activities')->orderBy('ordre')->get(), 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'itinerary_id' => 'required|exists:itineraries,id',
            'nom' => 'required|string|max:255',
            'notes' => 'nullable|string',
            'date_etape' => 'nullable|date',
            'ordre' => 'nullable|integer',
            'est_obligatoire' => 'nullable|boolean',
        ]);

        $validated['est_obligatoire'] = $validated['est_obligatoire'] ?? false;

        $step = Step::create($validated);

        return response()->json($step->load('activities'), 201);
    }

    public function show(Step $step)
    {
        return response()->json($step->load('activities'), 200);
    }

    public function update(Request $request, Step $step)
    {
        $validated = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'notes' => 'nullable|string',
            'date_etape' => 'nullable|date',
            'ordre' => 'nullable|integer',
            'est_obligatoire' => 'nullable|boolean',
        ]);

        $step->update($validated);

        return response()->json($step->load('activities'), 200);
    }

    public function destroy(Step $step)
    {
        if ($step->est_obligatoire) {
            return response()->json([
                'message' => 'Une étape obligatoire ne peut pas être supprimée.',
            ], 422);
        }

        $step->delete();

        return response()->json(null, 204);
    }
}