<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Accommodation;
use Illuminate\Http\Request;

class AccommodationController extends Controller
{
    public function index()
    {
        return response()->json(Accommodation::all(), 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'step_id' => 'required|exists:steps,id',
            'nom' => 'required|string|max:255',
            'prix_par_nuit' => 'required|numeric|min:0',
            'nombre_nuits' => 'required|integer|min:1',
        ]);

        $accommodation = Accommodation::create($validated);

        return response()->json($accommodation, 201);
    }

    public function show(Accommodation $accommodation)
    {
        return response()->json($accommodation, 200);
    }

    public function update(Request $request, Accommodation $accommodation)
    {
        $validated = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'prix_par_nuit' => 'sometimes|numeric|min:0',
            'nombre_nuits' => 'sometimes|integer|min:1',
        ]);

        $accommodation->update($validated);

        return response()->json($accommodation, 200);
    }

    public function destroy(Accommodation $accommodation)
    {
        $accommodation->delete();

        return response()->json(null, 204);
    }
}