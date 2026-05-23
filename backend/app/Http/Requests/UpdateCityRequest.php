<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCityRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->hasPermissionTo('update cities');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'region_id' => 'required|integer|exists:regions,id',
            'name_en' => 'required|string|max:255',
            'name_am' => 'required|string|max:255',
            'is_active' => 'sometimes|boolean',
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
            'name_en.required' => 'English city name is required.',
            'name_am.required' => 'Amharic city name is required.',
        ];
    }
}
