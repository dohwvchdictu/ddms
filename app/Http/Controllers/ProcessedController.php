<?php

namespace App\Http\Controllers;

use App\Actions\Documents\ProcessedDocuments;
use App\Http\Controllers\Concerns\ReadsListFilters;
use App\Http\Requests\Documents\ForwardDocumentsRequest;
use App\Models\Document;
use App\Services\ApiService;
use App\Support\DocumentTypes;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Processed: what this office forwarded on (closed ones are under Closed). Replaces Livewire Status\Forwarded. */
class ProcessedController extends Controller
{
    use ReadsListFilters;

    public const PER_PAGE = 25;

    public const PER_PAGE_OPTIONS = [10, 25, 50, 100];

    public const MAX_SELECTION = ForwardDocumentsRequest::MAX_DOCUMENTS;

    /** Newest first by default: the latest work here matters most. */
    public const SORTS = ['-processed_at', 'processed_at', 'control_no', '-control_no'];

    public function index(Request $request, ProcessedDocuments $processed, ApiService $api): Response
    {
        $filters = $this->filters($request);
        $officeId = session('user')['office']['id'];

        return Inertia::render('processed/index', [
            // Deferred: the page opens with a skeleton and the list follows.
            // Filter changes and page turns ask for these by name, so they come
            // back in the same response. Rescued: a failure offers a retry.
            'documents' => Inertia::defer(function () use ($filters, $officeId, $processed, $api) {
                [$column, $direction] = self::sortParts($filters['sort']);

                return $processed->withLatestStep($processed->query($officeId, $filters)->select('documents.*'), $officeId)
                    ->with(['category', 'citizencharter'])
                    ->orderBy($column === 'control_no' ? 'documents.control_no' : 'processed_at', $direction)
                    ->orderBy('documents.id', $direction)
                    ->paginate($filters['per_page'])
                    ->withQueryString()
                    ->through($this->rowMapper($api, $processed));
            }, rescue: true),
            'filters' => $filters,
            'facets' => Inertia::defer(fn () => $processed->facets($officeId, $filters), rescue: true),
            'statusOptions' => ProcessedDocuments::STATUSES,
            'defaultRange' => self::defaultRange(),
            'perPageOptions' => self::PER_PAGE_OPTIONS,
            'maxSelection' => self::MAX_SELECTION,
        ]);
    }

    /** Every row matching the filters that can go into a logbook, for "Select every match". Capped. */
    public function selectable(Request $request, ProcessedDocuments $processed, ApiService $api): JsonResponse
    {
        $officeId = session('user')['office']['id'];
        $query = $processed->query($officeId, $this->filters($request))->where('documents.status', ProcessedDocuments::LOGBOOK_STATUS);
        $total = (clone $query)->count();

        $rows = $processed->withLatestStep($query->select('documents.*'), $officeId)
            ->with(['category', 'citizencharter'])
            ->orderByDesc('processed_at')
            ->limit(self::MAX_SELECTION)
            ->get()
            ->map($this->rowMapper($api, $processed));

        return response()->json(['rows' => $rows, 'total' => $total]);
    }

    /** @return \Closure(Document): array<string, mixed> */
    protected function rowMapper(ApiService $api, ProcessedDocuments $processed): \Closure
    {
        // Full office list, so a since-closed office still resolves.
        $offices = collect($api->getOfficesData()['officeList'] ?? [])->keyBy('id');
        $employees = collect($api->getEmployeesData()['employeesList'] ?? [])->keyBy('id');
        $steps = $processed->stepNames();

        return fn (Document $document) => [
            'id' => $document->id,
            'control_no' => $document->control_no,
            'subject' => $document->subject,
            'classification' => $document->classification,
            'charter' => $document->category_id ? $document->citizencharter?->name : null,
            'source' => $document->source,
            'status' => $document->status,
            'is_bundle' => (bool) $document->is_bundle,
            'selectable' => $document->status === ProcessedDocuments::LOGBOOK_STATUS,
            'step' => $steps[$document->processed_action] ?? null,
            'processed_at' => $document->processed_at ? Carbon::parse($document->processed_at)->toIso8601String() : null,
            'processed_by' => self::employeeName($employees[$document->processed_by] ?? null),
            // Where it is now: another office, or still this one (e.g. closed here).
            'now_at' => [
                'code' => $offices[$document->assigned_to]['officeCode'] ?? null,
                'name' => $offices[$document->assigned_to]['officeName'] ?? null,
            ],
        ];
    }

    /** @return array{type: string, search: string, statuses: list<string>, from: string|null, to: string|null, sort: string, per_page: int} */
    protected function filters(Request $request): array
    {
        $perPage = (int) $request->query('per_page', self::PER_PAGE);

        return [
            'type' => DocumentTypes::normalize($request->query('type')),
            'search' => trim((string) $request->query('search', '')),
            'statuses' => self::list($request, 'status', ProcessedDocuments::STATUSES),
            ...self::dateRange($request),
            'sort' => in_array($request->query('sort'), self::SORTS, true) ? $request->query('sort') : self::SORTS[0],
            'per_page' => in_array($perPage, self::PER_PAGE_OPTIONS, true) ? $perPage : self::PER_PAGE,
        ];
    }
}
