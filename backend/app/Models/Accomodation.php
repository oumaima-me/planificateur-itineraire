<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Accommodation extends Model
{
    protected $fillable = [
        'step_id',
        'nom',
        'prix_par_nuit',
        'nombre_nuits',
    ];

    protected function casts(): array
    {
        return [
            'prix_par_nuit' => 'decimal:2',
            'nombre_nuits' => 'integer',
        ];
    }

    public function step()
    {
        return $this->belongsTo(Step::class);
    }
}