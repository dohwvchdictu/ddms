<?php

namespace App\Http\Controllers;

use App\Actions\Auth\ConfirmPassword;
use App\Actions\Documents\CloseDocuments;
use App\Actions\Documents\EndorseDocuments;
use App\Actions\Documents\ForwardDocuments;
use App\Actions\Documents\PendingDocuments;
use App\Http\Controllers\Concerns\ReadsListFilters;
use App\Http\Requests\Documents\ForwardDocumentsRequest;
use App\Models\Document;
use App\Services\ApiService;
use App\Support\DocumentSender;
use App\Support\DocumentTypes;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/** Pending: documents received here and on process. Replaces Livewire Status\Pending. */
class PendingController extends Controller
{
    use ReadsListFilters;

    public const PER_PAGE = 25;

    public const PER_PAGE_OPTIONS = [10, 25, 50, 100];

    public const MAX_SELECTION = ForwardDocumentsRequest::MAX_DOCUMENTS;

    /** Oldest first by default: what has waited longest matters most. */
    public const SORTS = ['updated_at', '-updated_at', 'control_no', '-control_no'];

    /** Closing this many documents or more at once asks for the HRIS password instead of a code. */
    public const PASSWORD_THRESHOLD = 5;

    /** Length of the code typed to close fewer than PASSWORD_THRESHOLD documents. */
    public const CLOSE_CODE_LENGTH = 6;

    protected const CLOSE_CODE_KEY = 'pending.close_code';

    public function index(Request $request, PendingDocuments $pending, ApiService $api): Response
    {
        $filters = $this->filters($request);
        $officeId = session('user')['office']['id'];
        $employeeId = session('user')['id'] ?? null;

        // The page and outsideRange both need it; built once, on first use.
        $page = null;
        $documents = function () use (&$page, $filters, $officeId, $employeeId, $pending, $api) {
            if ($page === null) {
                [$column, $direction] = self::sortParts($filters['sort']);

                $page = DocumentSender::select($pending->query($officeId, $filters, $employeeId)->select('documents.*'), $officeId)
                    ->with(['category', 'citizencharter'])
                    ->orderBy("documents.{$column}", $direction)
                    ->orderBy('documents.id', $direction)
                    ->paginate($filters['per_page'])
                    ->withQueryString()
                    ->through($this->rowMapper($api));
            }

            return $page;
        };

        return Inertia::render('pending/index', [
            // Deferred: the page opens with a skeleton and the list follows.
            // Filter changes, page turns and the actions ask for these by name,
            // so they come back in the same response. Rescued: a failure offers a retry.
            'documents' => Inertia::defer($documents, rescue: true),
            'filters' => $filters,
            'facets' => Inertia::defer(fn () => $pending->facets($officeId, $filters, $employeeId), rescue: true),
            'defaultRange' => self::defaultRange(),
            // On process here but hidden by the dates, so the list and the sidebar badge still add up.
            'outsideRange' => Inertia::defer(fn () => $filters['from'] || $filters['to']
                ? $pending->query($officeId, [...$filters, 'from' => null, 'to' => null], $employeeId)->count() - $documents()->total()
                : 0, rescue: true),
            'perPageOptions' => self::PER_PAGE_OPTIONS,
            'maxSelection' => self::MAX_SELECTION,
            'offices' => collect($api->getActiveOffices())
                ->map(fn (array $office) => ['id' => $office['id'], 'name' => $office['officeName'] ?? '', 'code' => $office['officeCode'] ?? null])
                ->values(),
            'closePasswordThreshold' => self::PASSWORD_THRESHOLD,
        ]);
    }

    /** Every row matching the filters, for "Select every match". Capped. */
    public function selectable(Request $request, PendingDocuments $pending, ApiService $api): JsonResponse
    {
        $officeId = session('user')['office']['id'];
        $query = $pending->query($officeId, $this->filters($request), session('user')['id'] ?? null);
        $total = (clone $query)->count();

        $rows = DocumentSender::select($query->select('documents.*'), $officeId)
            ->with(['category', 'citizencharter'])
            ->orderBy('documents.updated_at')
            ->limit(self::MAX_SELECTION)
            ->get()
            ->map($this->rowMapper($api));

        return response()->json(['rows' => $rows, 'total' => $total]);
    }

    public function forward(ForwardDocumentsRequest $request, ForwardDocuments $forward, PendingDocuments $pending, ApiService $api): RedirectResponse
    {
        $user = session('user');
        $office = collect($api->getActiveOffices())->firstWhere('id', $request->input('assigned_to'));

        $count = $forward->handle(
            array_map('intval', $request->input('document_ids')),
            $user,
            ['id' => $office['id'], 'name' => $office['officeName'] ?? 'the selected office'],
            $request->input('endorsed_to'),
            $request->input('remarks'),
            $pending->actionable($user['office']['id']),
        );

        return $this->done($count, ($count === 1 ? 'Document' : "{$count} documents") . ' forwarded', 'To ' . ($office['officeName'] ?? 'the selected office'));
    }

    public function endorse(Request $request, EndorseDocuments $endorse, ApiService $api): RedirectResponse
    {
        $user = session('user');
        $colleagues = collect($api->getEmployeesData()['employeesList'] ?? [])
            ->filter(fn ($employee) => (string) ($employee['office']['id'] ?? null) === (string) $user['office']['id'])
            ->keyBy('id');

        $data = $request->validate([
            'document_ids' => ['required', 'array', 'min:1', 'max:' . self::MAX_SELECTION],
            'document_ids.*' => ['integer'],
            'endorsed_to' => ['required', Rule::in($colleagues->keys()->all())],
            'remarks' => ['required', 'string', 'max:1000'],
        ], [
            'endorsed_to.required' => 'Choose who to endorse it to.',
            'endorsed_to.in' => 'Endorse only to someone in your office.',
            'remarks.required' => 'Add a note for them.',
        ]);

        $name = self::employeeName($colleagues[$data['endorsed_to']]) ?? 'the selected employee';
        $count = $endorse->handle(array_map('intval', $data['document_ids']), $user, ['id' => $data['endorsed_to'], 'name' => $name], trim($data['remarks']));

        if ($count === 0) {
            Inertia::flash('toast', ['type' => 'info', 'message' => 'No changes', 'description' => "Already endorsed to {$name}."]);

            return back();
        }

        return $this->done($count, ($count === 1 ? 'Document' : "{$count} documents") . " endorsed to {$name}");
    }

    /**
     * A fresh code for closing a few documents, kept in the session until a close
     * uses it. Easy-to-read characters only: no 0/O or 1/I/L to mix up.
     */
    public function closeCode(): JsonResponse
    {
        $alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
        $code = '';

        for ($i = 0; $i < self::CLOSE_CODE_LENGTH; $i++) {
            $code .= $alphabet[random_int(0, strlen($alphabet) - 1)];
        }

        session([self::CLOSE_CODE_KEY => $code]);

        return response()->json(['code' => $code]);
    }

    public function close(Request $request, CloseDocuments $close, ConfirmPassword $confirmPassword, ApiService $api): RedirectResponse
    {
        $data = $request->validate([
            'document_ids' => ['required', 'array', 'min:1', 'max:' . self::MAX_SELECTION],
            'document_ids.*' => ['integer'],
            'remarks' => ['required', 'string', 'max:1000'],
            'code' => ['nullable', 'string'],
            'password' => ['nullable', 'string'],
        ], [
            'remarks.required' => 'Say how it was acted upon.',
        ]);

        // Closing can't be undone: a few documents take the code shown in the
        // window, a batch of PASSWORD_THRESHOLD or more takes the HRIS password.
        if (count($data['document_ids']) >= self::PASSWORD_THRESHOLD) {
            if (blank($data['password'] ?? null)) {
                throw ValidationException::withMessages(['password' => 'Enter your HRIS password to close this many documents.']);
            }

            $confirmPassword->handle($data['password']);
        } else {
            $expected = session(self::CLOSE_CODE_KEY);

            if (! is_string($expected) || strtoupper(trim((string) ($data['code'] ?? ''))) !== $expected) {
                throw ValidationException::withMessages(['code' => 'The code does not match. Type it exactly as shown.']);
            }
        }

        // Used up: the next close gets a new code.
        session()->forget(self::CLOSE_CODE_KEY);

        $user = session('user');
        $officeName = collect($api->getOfficesData()['officeList'] ?? [])->firstWhere('id', $user['office']['id'])['officeName'] ?? 'this office';

        $count = $close->handle(array_map('intval', $data['document_ids']), $user, $officeName, trim($data['remarks']));

        // A route's end: celebrated in the middle of the screen rather than a corner toast.
        return $this->done($count, ($count === 1 ? 'Document' : "{$count} documents") . ' closed', 'Their route ends here.', center: true);
    }

    /** The toast after an action, or a warning when nothing qualified any more. */
    protected function done(int $count, string $message, ?string $description = null, bool $center = false): RedirectResponse
    {
        Inertia::flash('toast', $count > 0
            ? ['type' => 'success', 'message' => $message, 'description' => $description, 'center' => $center]
            : ['type' => 'warning', 'message' => 'Nothing was changed', 'description' => 'The selected documents are no longer on process here.']);

        return back();
    }

    /** @return \Closure(Document): array<string, mixed> */
    protected function rowMapper(ApiService $api): \Closure
    {
        $offices = collect($api->getOfficesData()['officeList'] ?? [])->keyBy('id');
        $employees = collect($api->getEmployeesData()['employeesList'] ?? [])->keyBy('id');
        $me = session('user')['id'] ?? null;

        return fn (Document $document) => [
            'id' => $document->id,
            'control_no' => $document->control_no,
            'subject' => $document->subject,
            'classification' => $document->classification,
            'charter' => $document->category_id ? $document->citizencharter?->name : null,
            'source' => $document->source,
            'status' => $document->status,
            'is_bundle' => (bool) $document->is_bundle,
            'from' => $document->from_office_id ? [
                'code' => $offices[$document->from_office_id]['officeCode'] ?? null,
                'name' => $offices[$document->from_office_id]['officeName'] ?? null,
            ] : null,
            // Its last step here: received, or endorsed since.
            'since' => $document->updated_at?->toIso8601String(),
            'endorsed_to' => self::employeeName($employees[$document->endorsed_to] ?? null),
            'endorsed_to_me' => $me !== null && (string) $document->endorsed_to === (string) $me,
        ];
    }

    /** @return array{type: string, search: string, endorsed: string|null, from: string|null, to: string|null, sort: string, per_page: int} */
    protected function filters(Request $request): array
    {
        $perPage = (int) $request->query('per_page', self::PER_PAGE);

        return [
            'type' => DocumentTypes::normalize($request->query('type')),
            'search' => trim((string) $request->query('search', '')),
            'endorsed' => $request->query('endorsed') === 'me' ? 'me' : null,
            ...self::dateRange($request),
            'sort' => in_array($request->query('sort'), self::SORTS, true) ? $request->query('sort') : self::SORTS[0],
            'per_page' => in_array($perPage, self::PER_PAGE_OPTIONS, true) ? $perPage : self::PER_PAGE,
        ];
    }
}
