<?php

namespace App\Http\Controllers;

use App\Actions\Documents\RoutingLogbook;
use App\Http\Controllers\Concerns\ReadsListFilters;
use App\Models\Document;
use App\Models\Log;
use App\Services\ApiService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Routing Logbook: what this office forwarded, and whether it has been received. Replaces Livewire Views\RoutingLogbook. */
class RoutingLogbookController extends Controller
{
    use ReadsListFilters;

    public const PER_PAGE = 25;

    public const PER_PAGE_OPTIONS = [10, 25, 50, 100];

    /** Newest first by default: the page is watched as things go out. */
    public const SORTS = ['-created_at', 'created_at'];

    public function index(Request $request, RoutingLogbook $logbook, ApiService $api): Response
    {
        $filters = $this->filters($request);
        $officeId = session('user')['office']['id'];
        [, $direction] = self::sortParts($filters['sort']);

        $entries = $logbook->withReceipt($logbook->query($officeId, $filters)->select([
            'logs.id', 'logs.document_id', 'logs.assigned_to', 'logs.created_at',
            'documents.control_no', 'documents.subject', 'documents.category_id', 'documents.is_bundle', 'documents.status',
        ]))
            ->orderBy('logs.created_at', $direction)
            ->orderBy('logs.id', $direction)
            ->paginate($filters['per_page'])
            ->withQueryString();

        $offices = collect($api->getOfficesData()['officeList'] ?? [])->keyBy('id');
        $employees = collect($api->getEmployeesData()['employeesList'] ?? [])->keyBy('id');
        $classifications = Document::with(['category', 'citizencharter'])
            ->whereIn('id', $entries->pluck('document_id'))
            ->get()
            ->mapWithKeys(fn (Document $document) => [$document->id => $document->classification]);

        $entries->through(fn (Log $entry) => [
            'id' => $entry->id,
            'document_id' => $entry->document_id,
            'control_no' => $entry->control_no,
            'subject' => $entry->subject,
            'classification' => $classifications[$entry->document_id] ?? null,
            'is_bundle' => (bool) $entry->is_bundle,
            'to' => [
                'code' => $offices[$entry->assigned_to]['officeCode'] ?? null,
                'name' => $offices[$entry->assigned_to]['officeName'] ?? null,
            ],
            'forwarded_at' => $entry->created_at?->toIso8601String(),
            'receipt' => $entry->received_at ? 'received' : ($entry->returned_at ? 'returned' : 'awaiting'),
            'received_at' => $entry->received_at ? Carbon::parse($entry->received_at)->toIso8601String() : null,
            'received_by' => self::employeeName($employees[$entry->received_by] ?? null),
            'returned_at' => $entry->returned_at ? Carbon::parse($entry->returned_at)->toIso8601String() : null,
        ]);

        return Inertia::render('routing-logbook/index', [
            'entries' => $entries,
            'filters' => $filters,
            'counts' => $logbook->counts($officeId, $filters),
            'defaultRange' => self::defaultRange(),
            'perPageOptions' => self::PER_PAGE_OPTIONS,
        ]);
    }

    /** @return array{receipt: string, search: string, from: string|null, to: string|null, sort: string, per_page: int} */
    protected function filters(Request $request): array
    {
        $perPage = (int) $request->query('per_page', self::PER_PAGE);

        return [
            'receipt' => in_array($request->query('receipt'), RoutingLogbook::RECEIPTS, true) ? $request->query('receipt') : 'all',
            'search' => trim((string) $request->query('search', '')),
            ...self::dateRange($request),
            'sort' => in_array($request->query('sort'), self::SORTS, true) ? $request->query('sort') : self::SORTS[0],
            'per_page' => in_array($perPage, self::PER_PAGE_OPTIONS, true) ? $perPage : self::PER_PAGE,
        ];
    }

    /**
     * The last 7 days (the date picker's "Last 7 days"): the logbook is watched
     * for what just went out, so it starts narrower than the other lists.
     *
     * @return array{from: string, to: string}
     */
    protected static function defaultRange(): array
    {
        return ['from' => now()->subDays(6)->toDateString(), 'to' => now()->toDateString()];
    }
}
