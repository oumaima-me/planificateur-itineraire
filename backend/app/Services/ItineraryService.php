<?php

namespace App\Services;

use App\Models\Itinerary;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class ItineraryService
{
    private function nestedRelations(): array
    {
        return [
            'steps' => function ($query) {
                $query->orderBy('ordre')->orderBy('id');
            },
            'steps.activities' => function ($query) {
                $query->orderBy('ordre')->orderBy('id');
            },
            'steps.accommodations' => function ($query) {
                $query->orderBy('id');
            },
        ];
    }

    public function listForUser(?int $userId, ?string $startDate = null, ?string $endDate = null): Collection
    {
        $today = Carbon::today()->toDateString();
        $query = Itinerary::with($this->nestedRelations());

        if ($userId) {
            $query->where('user_id', $userId);
        }

        if ($startDate) {
            $query->where(function ($q) use ($startDate) {
                $q->whereDate('date_fin', '>=', $startDate)
                    ->orWhere(function ($sub) use ($startDate) {
                        $sub->whereNull('date_fin')
                            ->whereDate('date_debut', '>=', $startDate);
                    });
            });
        }

        if ($endDate) {
            $query->where(function ($q) use ($endDate) {
                $q->whereDate('date_debut', '<=', $endDate)
                    ->orWhere(function ($sub) use ($endDate) {
                        $sub->whereNull('date_debut')
                            ->whereDate('date_fin', '<=', $endDate);
                    });
            });
        }

        return $query->get()
            ->sortBy(function ($itinerary) use ($today) {
                $refDate = $itinerary->date_debut
                    ? Carbon::parse($itinerary->date_debut)->toDateString()
                    : ($itinerary->date_fin ? Carbon::parse($itinerary->date_fin)->toDateString() : null);

                $isFuture = ! $refDate || $refDate >= $today;
                $group = $isFuture ? 0 : 1;

                $timestamp = $refDate ? Carbon::parse($refDate)->timestamp : PHP_INT_MAX;
                $sortKey = $group === 0 ? $timestamp : -$timestamp;

                return sprintf('%d-%020d', $group, $sortKey + 100000000000);
            })
            ->values();
    }

    public function createWithDefaults(array $data, int $userId): Itinerary
    {
        $data['user_id'] = $userId;
        $itinerary = Itinerary::create($data);

        // Règle métier : étape obligatoire par défaut
        $defaultStep = $itinerary->steps()->create([
            'nom' => 'Étape obligatoire : ' . $itinerary->destination,
            'notes' => 'Étape par défaut obligatoire',
            'date_etape' => $itinerary->date_debut,
            'ordre' => 1,
            'est_obligatoire' => true,
        ]);

        // Règle métier : activité par défaut liée à l'étape
        $defaultStep->activities()->create([
            'nom' => 'Arrivée et installation',
            'notes' => 'Activité par défaut',
            'cout' => 0,
            'est_obligatoire' => true,
            'ordre' => 1,
        ]);

        return $itinerary->load($this->nestedRelations());
    }

    public function getDetails(Itinerary $itinerary): Itinerary
    {
        return $itinerary->load($this->nestedRelations());
    }

    public function getSummary(Itinerary $itinerary): array
    {
        $itinerary->load($this->nestedRelations());

        $initialBudget = (float) ($itinerary->budget ?? 0);
        $cumulativeSpent = 0.0;

        $stepsSummary = $itinerary->steps->map(function ($step, $index) use ($initialBudget, &$cumulativeSpent) {
            $activitiesCost = (float) $step->activities->sum(fn ($act) => (float) ($act->cout ?? 0));
            $accommodationsCost = (float) $step->accommodations->sum(
                fn ($acc) => (float) ($acc->prix_par_nuit ?? 0) * max(1, (int) ($acc->nombre_nuits ?? 1))
            );

            $stepTotal = $activitiesCost + $accommodationsCost;
            $cumulativeSpent += $stepTotal;
            $remainingAfterStep = $initialBudget - $cumulativeSpent;

            return [
                'id' => $step->id,
                'step_number' => $index + 1,
                'nom' => $step->nom,
                'date_etape' => $step->date_etape,
                'notes' => $step->notes,
                'est_obligatoire' => (bool) $step->est_obligatoire,
                'activities_cost' => round($activitiesCost, 2),
                'accommodations_cost' => round($accommodationsCost, 2),
                'step_total' => round($stepTotal, 2),
                'cumulative_spent' => round($cumulativeSpent, 2),
                'remaining_after_step' => round($remainingAfterStep, 2),
                'activities' => $step->activities,
                'accommodations' => $step->accommodations,
            ];
        })->values();

        $finalRemaining = $initialBudget - $cumulativeSpent;

        return [
            'itinerary' => $itinerary,
            'budget_summary' => [
                'initial_budget' => round($initialBudget, 2),
                'total_spent' => round($cumulativeSpent, 2),
                'final_remaining' => round($finalRemaining, 2),
                'is_over_budget' => $finalRemaining < 0,
            ],
            'steps' => $stepsSummary,
        ];
    }

    public function updateItinerary(Itinerary $itinerary, array $data): Itinerary
    {
        $itinerary->update($data);

        return $itinerary->load($this->nestedRelations());
    }

    public function deleteItinerary(Itinerary $itinerary): void
    {
        $itinerary->delete();
    }
}