<?php

namespace App\Http\Controllers;

use App\Actions\Documents\ForwardDocuments;
use App\Actions\Documents\OfficeDocuments;
use App\Http\Controllers\Concerns\ReadsListFilters;
use App\Http\Requests\Documents\ForwardDocumentsRequest;
use App\Models\Document;
use App\Services\ApiService;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** My Documents: what the signed-in employee's office encoded, filterable, and forwarding it. */
class MyDocumentsController extends Controller
{
    use ReadsListFilters;

    public const PER_PAGE = 25;

    /** Rows-per-page choices offered in View options. */
    public const PER_PAGE_OPTIONS = [10, 25, 50, 100];

    /** Sortable columns; a leading "-" means descending. */
    public const SORTS = ['-created_at', 'created_at', 'control_no', '-control_no'];

    /** Statuses that have a transmittal form to print (it needs a destination). */
    public const PRINTABLE_STATUSES = ['Forwarded', 'On Process', 'For Receiving'];

    public function __invoke(Request $request, OfficeDocuments $officeDocuments, ApiService $api): Response
    {
        $filters = $this->filters($request);
        $officeId = session('user')['office']['id'];

        [$column, $direction] = str_starts_with($filters['sort'], '-')
            ? [substr($filters['sort'], 1), 'desc']
            : [$filters['sort'], 'asc'];

        $documents = $officeDocuments->query($officeId, $filters)
            ->with(['category', 'citizencharter'])
            ->orderBy("documents.{$column}", $direction)
            ->orderBy('documents.id', $direction)
            ->paginate($filters['per_page'])
            ->withQueryString();

        $documents->through($this->rowMapper($api));

        return Inertia::render('my-documents/index', [
            'documents' => $documents,
            'filters' => $filters,
            'facets' => $officeDocuments->facets($officeId, $filters),
            'statusOptions' => OfficeDocuments::STATUSES,
            'defaultRange' => self::defaultRange(),
            'perPageOptions' => self::PER_PAGE_OPTIONS,
            // Destinations for Forward: active offices only.
            'offices' => collect($api->getActiveOffices())
                ->map(fn (array $office) => ['id' => $office['id'], 'name' => $office['officeName'] ?? '', 'code' => $office['officeCode'] ?? null])
                ->values(),
            'maxSelection' => ForwardDocumentsRequest::MAX_DOCUMENTS,
        ]);
    }

    /**
     * Every selectable row matching the current filters, for "Select all N
     * matching". Capped, so one click can't queue an unbounded batch.
     */
    public function selectable(Request $request, OfficeDocuments $officeDocuments, ApiService $api): JsonResponse
    {
        $query = $officeDocuments->selectable(session('user')['office']['id'], $this->filters($request));
        $total = (clone $query)->count();

        $rows = $query->with(['category', 'citizencharter'])
            ->orderByDesc('documents.created_at')
            ->orderByDesc('documents.id')
            ->limit(ForwardDocumentsRequest::MAX_DOCUMENTS)
            ->get()
            ->map($this->rowMapper($api));

        return response()->json(['rows' => $rows, 'total' => $total]);
    }

    public function forward(ForwardDocumentsRequest $request, ForwardDocuments $forwardDocuments, ApiService $api): RedirectResponse
    {
        $office = collect($api->getActiveOffices())->firstWhere('id', $request->input('assigned_to'));
        $officeName = $office['officeName'] ?? 'the selected office';

        $count = $forwardDocuments->handle(
            array_map('intval', $request->input('document_ids')),
            session('user'),
            ['id' => $office['id'], 'name' => $officeName],
            $request->input('endorsed_to'),
            $request->input('remarks'),
        );

        Inertia::flash('toast', $count > 0
            ? ['type' => 'success', 'message' => ($count === 1 ? 'Document' : "{$count} documents") . ' forwarded', 'description' => "To {$officeName}"]
            : ['type' => 'warning', 'message' => 'Nothing was forwarded', 'description' => 'The selected documents are no longer waiting to be forwarded.']);

        return back();
    }

    /**
     * Shapes a document as a table row. The office and employee directories are
     * read once (both cached for hours by ApiService): the full office list, not
     * just the active ones, so old documents sent to a since-closed office still
     * resolve.
     *
     * @return Closure(Document): array<string, mixed>
     */
    protected function rowMapper(ApiService $api): Closure
    {
        $offices = collect($api->getOfficesData()['officeList'] ?? [])->keyBy('id');
        $employees = collect($api->getEmployeesData()['employeesList'] ?? [])->keyBy('id');

        return fn (Document $document) => [
            'id' => $document->id,
            'control_no' => $document->control_no,
            'subject' => $document->subject,
            'classification' => $document->classification,
            // Shown as a second label only when the category already took the
            // headline; for a charter-only document the procedure *is* the headline.
            'charter' => $document->category_id ? $document->citizencharter?->name : null,
            'source' => $document->source,
            'status' => $document->status,
            'is_bundle' => (bool) $document->is_bundle,
            'turnaround_days' => $document->status === 'Closed' ? (int) ($document->turnaroundtime ?? 0) : null,
            'destination' => $document->assigned_to ? [
                'code' => $offices[$document->assigned_to]['officeCode'] ?? null,
                'name' => $offices[$document->assigned_to]['officeName'] ?? null,
            ] : null,
            'encoded_by' => self::employeeName($employees[$document->user_id] ?? null),
            'created_at' => $document->created_at?->toIso8601String(),
            'can_print' => in_array($document->status, self::PRINTABLE_STATUSES, true),
            'selectable' => OfficeDocuments::isSelectable($document),
        ];
    }

    /**
     * The filters from the query string. With no dates given at all the list
     * opens on the last 30 days; an explicitly blank date (`from=`) means no bound.
     *
     * @return array{type: string, search: string, statuses: list<string>, from: string|null, to: string|null, sort: string, per_page: int}
     */
    protected function filters(Request $request): array
    {
        $perPage = (int) $request->query('per_page', self::PER_PAGE);

        return [
            // The tab: everything unless one kind is picked.
            'type' => in_array($request->query('type'), OfficeDocuments::TYPES, true) ? $request->query('type') : 'all',
            'search' => trim((string) $request->query('search', '')),
            'statuses' => self::list($request, 'status', OfficeDocuments::STATUSES),
            ...self::dateRange($request),
            'sort' => in_array($request->query('sort'), self::SORTS, true) ? $request->query('sort') : self::SORTS[0],
            'per_page' => in_array($perPage, self::PER_PAGE_OPTIONS, true) ? $perPage : self::PER_PAGE,
        ];
    }
}
