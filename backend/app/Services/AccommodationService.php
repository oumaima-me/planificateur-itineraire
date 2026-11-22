<?php

namespace App\Services;

use App\Models\Accommodation;

class AccommodationService
{
    public function createAccommodation(array $data): Accommodation
    {
        return Accommodation::create($data);
    }

    public function updateAccommodation(Accommodation $accommodation, array $data): Accommodation
    {
        $accommodation->update($data);

        return $accommodation;
    }

    public function deleteAccommodation(Accommodation $accommodation): void
    {
        $accommodation->delete();
    }

    public function calculateTotalCost(Accommodation $accommodation): float
    {
        return (float) $accommodation->prix_par_nuit * (int) $accommodation->nombre_nuits;
    }
}