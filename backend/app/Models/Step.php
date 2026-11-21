<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Step extends Model
{
    protected $fillable = [
        'itinerary_id',
        'nom',
        'notes',
        'date_etape',
        'ordre',
        'est_obligatoire',
    ];

    protected function casts(): array
    {
        return [
            'est_obligatoire' => 'boolean',
        ];
    }

    public function itinerary()
    {
        return $this->belongsTo(Itinerary::class);
    }

    public function activities()
    {
        return $this->hasMany(Activity::class)->orderBy('ordre');
    }
    public function accommodations()
    {
        return $this->hasMany(Accommodation::class);
    }
}