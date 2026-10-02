<?php

namespace App\Http\Controllers;

use App\Actions\Documents\ClosedDocuments;
use App\Http\Controllers\Concerns\ReadsListFilters;
use App\Models\Document;
use App\Services\ApiService;
use App\Support\DocumentTypes;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Closed: what this office closed. Replaces Livewire Status\Closed. */
class ClosedController extends Controller
{
    use ReadsListFilters;

    public const PER_PAGE = 25;

    public const PER_PAGE_OPTIONS = [10, 25, 50, 100];

    /** Newest first by default: the latest closes matter most. */
    public const SORTS = ['-closed_at', 'closed_at', 'control_no', '-control_no'];

    public function index(Request $request, ClosedDocuments $closed, ApiService $api): Response
    {
        $filters = $this->filters($request);
        $officeId = session('user')['office']['id'];
        [$column, $direction] = self::sortParts($filters['sort']);

        $documents = $closed->withClose($closed->query($officeId, $filters)->select('documents.*'), $officeId)
            ->with(['category', 'citizencharter'])
            ->orderBy($column === 'control_no' ? 'documents.control_no' : 'closed_at', $direction)
            ->orderBy('documents.id', $direction)
            ->paginate($filters['per_page'])
            ->withQueryString();

        $employees = collect($api->getEmployeesData()['employeesList'] ?? [])->keyBy('id');

        $documents->through(fn (Document $document) => [
            'id' => $document->id,
            'control_no' => $document->control_no,
            'subject' => $document->subject,
            'classification' => $document->classification,
            'charter' => $document->category_id ? $document->citizencharter?->name : null,
            'source' => $document->source,
            'status' => $document->status,
            'is_bundle' => (bool) $document->is_bundle,
            'closed_at' => $document->closed_at ? Carbon::parse($document->closed_at)->toIso8601String() : null,
            'closed_by' => self::employeeName($employees[$document->closed_by] ?? null),
            'remarks' => filled($document->closed_remarks) ? $document->closed_remarks : null,
            // Working days from creation to close, saved when it was closed.
            'turnaround' => $document->turnaroundtime !== null ? (int) $document->turnaroundtime : null,
        ]);

        return Inertia::render('closed/index', [
            'documents' => $documents,
            'filters' => $filters,
            'facets' => $closed->facets($officeId, $filters),
            'defaultRange' => self::defaultRange(),
            'perPageOptions' => self::PER_PAGE_OPTIONS,
        ]);
    }

    /** @return array{type: string, search: string, from: string|null, to: string|null, sort: string, per_page: int} */
    protected function filters(Request $request): array
    {
        $perPage = (int) $request->query('per_page', self::PER_PAGE);

        return [
            'type' => DocumentTypes::normalize($request->query('type')),
            'search' => trim((string) $request->query('search', '')),
            ...self::dateRange($request),
            'sort' => in_array($request->query('sort'), self::SORTS, true) ? $request->query('sort') : self::SORTS[0],
            'per_page' => in_array($perPage, self::PER_PAGE_OPTIONS, true) ? $perPage : self::PER_PAGE,
        ];
    }
}
