<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Location extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'addressable_id',
        'addressable_type',
        'region_id',
        'city_id',
        'description_en',
        'description_am',
        'kebele',
        'latitude',
        'longitude',
        'address_type',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
    ];

    /**
     * Get the region this location belongs to.
     */
    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    /**
     * Get the city this location belongs to.
     */
    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    /**
     * Get the owning addressable model (Hospital or Pharmacy).
     */
    public function addressable(): MorphTo
    {
        return $this->morphTo();
    }
}
