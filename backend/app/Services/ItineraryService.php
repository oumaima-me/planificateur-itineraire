<?php

namespace App\Services;

use App\Models\Itinerary;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class ItineraryService
{
    public function listForUser(?int $userId): Collection
    {
        $today = Carbon::today()->toDateString();
        $query = Itinerary::with(['steps.activities', 'steps.accommodations']);

        if ($userId) {
            $query->where('user_id', $userId);
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

        return $itinerary->load(['steps.activities', 'steps.accommodations']);
    }

    public function getDetails(Itinerary $itinerary): Itinerary
    {
        return $itinerary->load(['steps.activities', 'steps.accommodations']);
    }

    public function updateItinerary(Itinerary $itinerary, array $data): Itinerary
    {
        $itinerary->update($data);

        return $itinerary->load(['steps.activities', 'steps.accommodations']);
    }

    public function deleteItinerary(Itinerary $itinerary): void
    {
        $itinerary->delete();
    }
}