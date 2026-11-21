<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    protected $fillable = [
        'step_id',
        'nom',
        'notes',
        'cout',
        'est_obligatoire',
        'ordre',
    ];

    protected function casts(): array
    {
        return [
            'cout' => 'decimal:2',
            'est_obligatoire' => 'boolean',
        ];
    }

    public function step()
    {
        return $this->belongsTo(Step::class);
    }
}