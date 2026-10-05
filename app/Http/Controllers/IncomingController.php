<?php

namespace App\Http\Controllers;

use App\Actions\Documents\IncomingDocuments;
use App\Actions\Documents\ReceiveDocuments;
use App\Http\Controllers\Concerns\ReadsListFilters;
use App\Models\Document;
use App\Services\ApiService;
use App\Support\DocumentTypes;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Incoming: what other offices sent here, waiting to be received. Replaces Livewire Status\Incoming. */
class IncomingController extends Controller
{
    use ReadsListFilters;

    public const PER_PAGE = 25;

    public const PER_PAGE_OPTIONS = [10, 25, 50, 100];

    /** Most documents one receive can take, a guard against runaway requests. */
    public const MAX_SELECTION = 500;

    /** Oldest first by default: what has waited longest matters most. */
    public const SORTS = ['updated_at', '-updated_at', 'control_no', '-control_no'];

    public function index(Request $request, IncomingDocuments $incoming, ApiService $api): Response
    {
        $filters = $this->filters($request);
        $officeId = session('user')['office']['id'];
        [$column, $direction] = self::sortParts($filters['sort']);

        $documents = $incoming->withSender($incoming->query($officeId, $filters)->select('documents.*'), $officeId)
            ->with(['category', 'citizencharter'])
            ->orderBy("documents.{$column}", $direction)
            ->orderBy('documents.id', $direction)
            ->paginate($filters['per_page'])
            ->withQueryString();

        $documents->through($this->rowMapper($api));

        return Inertia::render('incoming/index', [
            'documents' => $documents,
            'filters' => $filters,
            'facets' => $incoming->facets($officeId, $filters),
            'statusOptions' => IncomingDocuments::STATUSES,
            'defaultRange' => self::defaultRange(),
            // Waiting here but hidden by the dates, so the list and the sidebar badge still add up.
            'outsideRange' => $filters['from'] || $filters['to']
                ? $incoming->query($officeId, [...$filters, 'from' => null, 'to' => null])->count() - $documents->total()
                : 0,
            'perPageOptions' => self::PER_PAGE_OPTIONS,
            'maxSelection' => self::MAX_SELECTION,
        ]);
    }

    /** Every receivable row matching the filters, for "Select every match". Capped. */
    public function selectable(Request $request, IncomingDocuments $incoming, ApiService $api): JsonResponse
    {
        $officeId = session('user')['office']['id'];
        $query = $incoming->query($officeId, $this->filters($request));
        $total = (clone $query)->count();

        $rows = $incoming->withSender($query->select('documents.*'), $officeId)
            ->with(['category', 'citizencharter'])
            ->orderBy('documents.updated_at')
            ->limit(self::MAX_SELECTION)
            ->get()
            ->map($this->rowMapper($api));

        return response()->json(['rows' => $rows, 'total' => $total]);
    }

    public function receive(Request $request, ReceiveDocuments $receive, ApiService $api): RedirectResponse
    {
        $data = $request->validate([
            'document_ids' => ['required', 'array', 'min:1', 'max:' . self::MAX_SELECTION],
            'document_ids.*' => ['integer'],
        ], ['document_ids.required' => 'Select at least one document to receive.']);

        $user = session('user');
        $office = collect($api->getOfficesData()['officeList'] ?? [])->firstWhere('id', $user['office']['id']);

        $count = $receive->handle(array_map('intval', $data['document_ids']), $user, $office['officeName'] ?? ($user['office']['officeName'] ?? 'this office'));

        Inertia::flash('toast', $count > 0
            ? ['type' => 'success', 'message' => ($count === 1 ? 'Document' : "{$count} documents") . ' received', 'description' => 'They are now in Pending.']
            : ['type' => 'warning', 'message' => 'Nothing was received', 'description' => 'The selected documents are no longer waiting here.']);

        return back();
    }

    /** @return \Closure(Document): array<string, mixed> */
    protected function rowMapper(ApiService $api): \Closure
    {
        // Full office list, so a since-closed office still resolves.
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
            // When it was sent here: its last change.
            'sent_at' => $document->updated_at?->toIso8601String(),
            'endorsed_to' => self::employeeName($employees[$document->endorsed_to] ?? null),
            'endorsed_to_me' => $me !== null && (string) $document->endorsed_to === (string) $me,
        ];
    }

    /** @return array{type: string, search: string, statuses: list<string>, from: string|null, to: string|null, sort: string, per_page: int} */
    protected function filters(Request $request): array
    {
        $perPage = (int) $request->query('per_page', self::PER_PAGE);

        return [
            'type' => DocumentTypes::normalize($request->query('type')),
            'search' => trim((string) $request->query('search', '')),
            'statuses' => self::list($request, 'status', IncomingDocuments::STATUSES),
            ...self::dateRange($request),
            'sort' => in_array($request->query('sort'), self::SORTS, true) ? $request->query('sort') : self::SORTS[0],
            'per_page' => in_array($perPage, self::PER_PAGE_OPTIONS, true) ? $perPage : self::PER_PAGE,
        ];
    }
}
