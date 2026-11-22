<?php

namespace App\Services;

use App\Models\Activity;
use DomainException;

class ActivityService
{
    public function createActivity(array $data): Activity
    {
        if (! isset($data['ordre'])) {
            $maxOrdre = Activity::where('step_id', $data['step_id'])->max('ordre') ?? 0;
            $data['ordre'] = $maxOrdre + 1;
        }

        $data['cout'] = $data['cout'] ?? 0;
        $data['est_obligatoire'] = $data['est_obligatoire'] ?? false;

        return Activity::create($data);
    }

    public function updateActivity(Activity $activity, array $data): Activity
    {
        $activity->update($data);

        return $activity;
    }

    public function deleteActivity(Activity $activity): void
    {
        if ($activity->est_obligatoire) {
            throw new DomainException('Une activité obligatoire ne peut pas être supprimée.');
        }

        $activity->delete();
    }
}