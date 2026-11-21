<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    public function index()
    {
        return response()->json(Activity::orderBy('ordre')->get(), 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'step_id' => 'required|exists:steps,id',
            'nom' => 'required|string|max:255',
            'notes' => 'nullable|string',
            'cout' => 'nullable|numeric|min:0',
            'est_obligatoire' => 'nullable|boolean',
            'ordre' => 'nullable|integer',
        ]);

        $validated['cout'] = $validated['cout'] ?? 0;
        $validated['est_obligatoire'] = $validated['est_obligatoire'] ?? false;

        $activity = Activity::create($validated);

        return response()->json($activity, 201);
    }

    public function show(Activity $activity)
    {
        return response()->json($activity, 200);
    }

    public function update(Request $request, Activity $activity)
    {
        $validated = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'notes' => 'nullable|string',
            'cout' => 'nullable|numeric|min:0',
            'est_obligatoire' => 'nullable|boolean',
            'ordre' => 'nullable|integer',
        ]);

        $activity->update($validated);

        return response()->json($activity, 200);
    }

    public function destroy(Activity $activity)
    {
        if ($activity->est_obligatoire) {
            return response()->json([
                'message' => 'Une activité obligatoire ne peut pas être supprimée.',
            ], 422);
        }

        $activity->delete();

        return response()->json(null, 204);
    }
}