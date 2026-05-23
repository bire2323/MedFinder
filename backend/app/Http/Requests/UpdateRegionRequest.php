<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRegionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->hasPermissionTo('update regions');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        $regionId = $this->route('region')?->id;

        return [
            'name_en' => "required|string|max:255|unique:regions,name_en,{$regionId}",
            'name_am' => "required|string|max:255|unique:regions,name_am,{$regionId}",
            'code' => "nullable|string|max:10|unique:regions,code,{$regionId}",
            'is_active' => 'sometimes|boolean',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'name_en.required' => 'English region name is required.',
            'name_en.unique' => 'This English region name already exists.',
            'name_am.required' => 'Amharic region name is required.',
            'name_am.unique' => 'This Amharic region name already exists.',
            'code.unique' => 'This region code already exists.',
        ];
    }
}
