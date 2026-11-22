<?php

namespace App\Services;

use App\Models\Itinerary;
use App\Models\Step;
use DomainException;

class StepService
{
    public function createStep(array $data): Step
    {
        if (! isset($data['ordre'])) {
            $maxOrdre = Step::where('itinerary_id', $data['itinerary_id'])->max('ordre') ?? 0;
            $data['ordre'] = $maxOrdre + 1;
        }

        $data['est_obligatoire'] = $data['est_obligatoire'] ?? false;

        $step = Step::create($data);

        return $step->load(['activities', 'accommodations']);
    }

    public function updateStep(Step $step, array $data): Step
    {
        $step->update($data);

        return $step->load(['activities', 'accommodations']);
    }

    public function deleteStep(Step $step): void
    {
        if ($step->est_obligatoire) {
            throw new DomainException('Une étape obligatoire ne peut pas être supprimée.');
        }

        $step->delete();
    }
}