<?php

namespace App\Http\Requests\Documents;

use App\Services\ApiService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ForwardDocumentsRequest extends FormRequest
{
    /** Most documents one forward can send, a guard against runaway requests. */
    public const MAX_DOCUMENTS = 500;

    public function authorize(): bool
    {
        return isset(session('user')['id'], session('user')['office']['id']);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $api = app(ApiService::class);
        $offices = collect($api->getActiveOffices())->pluck('id')->all();

        // Optional, and only someone working in the destination office.
        $endorsable = collect($api->getEmployeesData()['employeesList'] ?? [])
            ->filter(fn ($employee) => ($employee['office']['id'] ?? null) == $this->input('assigned_to'))
            ->pluck('id')
            ->all();

        return [
            'document_ids' => ['required', 'array', 'min:1', 'max:' . self::MAX_DOCUMENTS],
            'document_ids.*' => ['integer'],
            'assigned_to' => ['required', Rule::in($offices)],
            'endorsed_to' => ['nullable', Rule::in($endorsable)],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'document_ids' => 'documents',
            'assigned_to' => 'office',
            'endorsed_to' => 'endorsed to',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'document_ids.required' => 'Select at least one document to forward.',
            'assigned_to.in' => 'Choose an active office to forward to.',
            'endorsed_to.in' => 'The person endorsed to must work in the office you are forwarding to.',
        ];
    }
}
