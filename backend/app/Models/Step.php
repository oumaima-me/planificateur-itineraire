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
    ];

    public function itinerary()
    {
        return $this->belongsTo(Itinerary::class);
    }
}