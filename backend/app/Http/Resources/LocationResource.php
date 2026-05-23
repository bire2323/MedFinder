<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LocationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'addressable_id' => $this->addressable_id,
            'addressable_type' => $this->addressable_type,
            'region_id' => $this->region_id,
            'city_id' => $this->city_id,
            'region' => new RegionResource($this->whenLoaded('region')),
            'city' => new CityResource($this->whenLoaded('city')),
            'kebele' => $this->kebele,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'address_type' => $this->address_type,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
