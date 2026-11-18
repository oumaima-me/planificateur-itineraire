<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Step;
use Illuminate\Http\Request;

class StepController extends Controller
{
    public function index()
    {
        return response()->json(Step::all(), 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'itinerary_id' => 'required|exists:itineraries,id',
            'nom' => 'required|string|max:255',
            'notes' => 'nullable|string',
            'date_etape' => 'nullable|date',
            'ordre' => 'nullable|integer',
        ]);

        $step = Step::create($validated);
        return response()->json($step, 201);
    }

    public function show(Step $step)
    {
        return response()->json($step, 200);
    }

    public function update(Request $request, Step $step)
    {
        $validated = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'notes' => 'nullable|string',
            'date_etape' => 'nullable|date',
            'ordre' => 'nullable|integer',
        ]);

        $step->update($validated);
        return response()->json($step, 200);
    }

    public function destroy(Step $step)
    {
        $step->delete();
        return response()->json(null, 204);
    }
}