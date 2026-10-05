<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Adding or editing a category (Administration › Categories). Access is checked by the route's `can:administer`. */
class SaveCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('categories', 'name')->ignore($this->route('category'))],
            'required_days' => ['required', 'integer', 'min:1', 'max:365'],
            'is_active' => ['required', 'boolean'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'name.unique' => 'There is already a category with this name.',
            'required_days.required' => 'Enter the prescribed timeline in working days.',
            'required_days.min' => 'The timeline must be at least 1 working day.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['name' => trim((string) $this->input('name'))]);
    }
}
