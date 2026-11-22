<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Accommodation;
use App\Services\AccommodationService;
use Illuminate\Http\Request;

class AccommodationController extends Controller
{
    public function __construct(private readonly AccommodationService $accommodationService)
    {
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'step_id' => 'required|exists:steps,id',
            'nom' => 'required|string|max:255',
            'prix_par_nuit' => 'required|numeric|min:0',
            'nombre_nuits' => 'required|integer|min:1',
        ]);

        $accommodation = $this->accommodationService->createAccommodation($validated);

        return response()->json($accommodation, 201);
    }

    public function update(Request $request, Accommodation $accommodation)
    {
        $validated = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'prix_par_nuit' => 'sometimes|numeric|min:0',
            'nombre_nuits' => 'sometimes|integer|min:1',
        ]);

        $updated = $this->accommodationService->updateAccommodation($accommodation, $validated);

        return response()->json($updated, 200);
    }

    public function destroy(Accommodation $accommodation)
    {
        $this->accommodationService->deleteAccommodation($accommodation);

        return response()->json(null, 204);
    }
}