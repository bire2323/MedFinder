<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Region Resource
 * Path: app/Http/Resources/RegionResource.php
 */
class RegionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name_en' => $this->name_en,
            'name_am' => $this->name_am,
            'code' => $this->code,
            'is_active' => $this->is_active,
            'cities_count' => $this->whenCounted('cities'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
