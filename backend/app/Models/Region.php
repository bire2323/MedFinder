<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Region extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name_en',
        'name_am',
        'code',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get all cities in this region.
     */
    public function cities(): HasMany
    {
        return $this->hasMany(City::class);
    }

    /**
     * Get all active cities in this region.
     */
    public function activeCities(): HasMany
    {
        return $this->cities()->where('is_active', true);
    }

    /**
     * Get all locations in this region.
     */
    public function locations(): HasMany
    {
        return $this->hasMany(Location::class);
    }

    /**
     * Scope to get only active regions.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to search by name (English or Amharic).
     */
    public function scopeSearch($query, $search)
    {
        return $query->where('name_en', 'like', "%{$search}%")
                    ->orWhere('name_am', 'like', "%{$search}%");
    }
}
