<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * City Resource
 * Path: app/Http/Resources/CityResource.php
 */
class CityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'region_id' => $this->region_id,
            'name_en' => $this->name_en,
            'name_am' => $this->name_am,
            'is_active' => $this->is_active,
            'region' => [
                'id' => $this->region->id,
                'name_en' => $this->region->name_en,
                'name_am' => $this->region->name_am,
            ],
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
