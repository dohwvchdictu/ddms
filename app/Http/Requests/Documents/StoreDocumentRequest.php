<?php

namespace App\Http\Requests\Documents;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return isset(session('user')['id'], session('user')['office']['id']);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        // A charter transaction is classified by its charter procedure, so it
        // needs that instead of a category.
        $isArta = $this->boolean('is_arta');

        // The number the form was issued: it has to be this employee's own
        // (DC + office + employee + timestamp) and not already taken, e.g. by a
        // second save from the same form.
        $user = session('user');
        $prefix = preg_quote('DC' . $user['office']['id'] . $user['id'], '/');

        return [
            'control_no' => ['required', 'string', "regex:/^{$prefix}\\d{14}$/", Rule::unique('documents', 'control_no')],
            'source' => ['required', Rule::in(['internal', 'external'])],
            'is_arta' => ['required', 'boolean'],
            'category_id' => $isArta
                ? ['nullable']
                : ['required', Rule::exists('categories', 'id')],
            'citizen_charter_id' => $isArta
                ? ['required', Rule::exists('citizen_charters', 'id')->where('is_active', true)]
                : ['nullable'],
            'subject' => ['required', 'string', 'min:8', 'max:500'],
            'is_bundle' => ['required', 'boolean'],
            // Where to go after saving: the confirmation page, or ("new") a fresh form.
            'after' => ['nullable', Rule::in(['new'])],
        ];
    }

    /**
     * The control number is read-only on the form. When it fails, the page the
     * error lands on has already been issued a new one (see
     * CreateDocument::pendingControlNumber), so saving again is all it takes.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'control_no.unique' => 'That control number was already used, so a new one has been issued. Save again to use it.',
            'control_no.regex' => 'That control number is no longer valid, so a new one has been issued. Save again to use it.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        // Named as the form labels them.
        return [
            'control_no' => 'document control no.',
            'source' => 'document source',
            'is_arta' => 'citizen charter',
            'category_id' => 'document category',
            'citizen_charter_id' => 'charter procedure',
        ];
    }
}
