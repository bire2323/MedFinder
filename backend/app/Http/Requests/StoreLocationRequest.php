<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLocationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'addressable_id' => 'required|integer',
            'addressable_type' => 'required|string|in:App\Models\Hospital,App\Models\Pharmacy',
            'region_id' => 'required|integer|exists:regions,id',
            'city_id' => 'required|integer|exists:cities,id',
            'zone_en' => 'nullable|string|max:255',
            'zone_am' => 'nullable|string|max:255',
            'kebele' => 'required|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'address_type' => 'required|string|max:100',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'region_id.required' => 'Region is required.',
            'region_id.exists' => 'The selected region does not exist.',
            'city_id.required' => 'City is required.',
            'city_id.exists' => 'The selected city does not exist.',
            'latitude.numeric' => 'Latitude must be a valid number.',
            'latitude.between' => 'Latitude must be between -90 and 90.',
            'longitude.numeric' => 'Longitude must be a valid number.',
            'longitude.between' => 'Longitude must be between -180 and 180.',
            'kebele.required' => 'Kebele is required.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $cityId = $this->input('city_id');
            $regionId = $this->input('region_id');

            if ($cityId && $regionId) {
                $cityBelongsToRegion = \App\Models\City::where('id', $cityId)
                    ->where('region_id', $regionId)
                    ->exists();

                if (!$cityBelongsToRegion) {
                    $validator->errors()->add('city_id', 'The selected city does not belong to the selected region.');
                }
            }
        });
    }
}
