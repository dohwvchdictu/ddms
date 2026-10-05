<?php

namespace App\Http\Requests\Admin;

use App\Services\ApiService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Adding or editing a Citizen's Charter process. Access is checked by the route's `can:administer`. */
class SaveCitizenCharterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $offices = collect(app(ApiService::class)->getActiveOffices())->pluck('id')->map(fn ($id) => (string) $id)->all();

        return [
            // The same process name may exist in two offices, not twice in one.
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('citizen_charters', 'name')->where('office_id', $this->input('office_id'))->ignore($this->route('citizenCharter')),
            ],
            'office_id' => ['required', Rule::in($offices)],
            'required_days' => ['required', 'integer', 'min:1', 'max:365'],
            'is_external' => ['required', 'boolean'],
            'is_active' => ['required', 'boolean'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'name.unique' => 'This office already has a process with this name.',
            'office_id.required' => 'Choose the office that owns this process.',
            'office_id.in' => 'Choose an active office.',
            'required_days.required' => 'Enter the prescribed timeline in working days.',
            'required_days.min' => 'The timeline must be at least 1 working day.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['name' => trim((string) $this->input('name')), 'office_id' => (string) $this->input('office_id')]);
    }
}
