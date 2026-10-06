<?php

namespace App\Http\Controllers\Reports;

use App\Actions\Reports\ExternalRequestsReport;
use App\Http\Controllers\Concerns\ReadsListFilters;
use App\Http\Controllers\Controller;
use App\Services\ApiService;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\View\View;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Report › External Requests: the office's external requests and their
 * deadlines, on screen and printed. Replaces Livewire Report\ExternalDocuments
 * and MiscController's all-offices summary print (the print now shows what the
 * screen shows).
 */
class ExternalRequestsController extends Controller
{
    use ReadsListFilters;

    public const PER_PAGE = 25;

    public const PER_PAGE_OPTIONS = [10, 25, 50, 100];

    /** Newest first by default; `remaining` puts the most urgent first. */
    public const SORTS = ['-created_at', 'created_at', 'remaining'];

    public function index(Request $request, ExternalRequestsReport $report, ApiService $api): Response
    {
        $filters = $this->filters($request);
        // Both deferred props come from the same rows; built once, on first use.
        $rows = null;
        $loadRows = function () use (&$rows, $filters, $report, $api) {
            return $rows ??= $this->rows($filters, $report, $api);
        };

        return Inertia::render('reports/external-requests', [
            // Deferred: the page opens with a skeleton and the list follows
            // (see TurnaroundController). Rescued: a failure offers a retry.
            'requests' => Inertia::defer(function () use ($loadRows, $filters, $request) {
                $rows = $loadRows();
                $shown = $this->sorted($filters['state'] === 'all' ? $rows : $rows->where('state', $filters['state']), $filters['sort']);
                $page = LengthAwarePaginator::resolveCurrentPage();

                return (new LengthAwarePaginator($shown->forPage($page, $filters['per_page'])->values(), $shown->count(), $filters['per_page'], $page))
                    ->withPath($request->url())
                    ->withQueryString();
            }, rescue: true),
            'filters' => $filters,
            'counts' => Inertia::defer(fn () => ExternalRequestsReport::counts($loadRows()), rescue: true),
            'defaultRange' => self::defaultRange(),
            'perPageOptions' => self::PER_PAGE_OPTIONS,
        ]);
    }

    /** The same list, every row on paper: the period, search, tab and order on screen. */
    public function print(Request $request, ExternalRequestsReport $report, ApiService $api): View
    {
        $filters = $this->filters($request);
        $rows = $this->rows($filters, $report, $api);

        return view('reports.external-requests-print', [
            'rows' => $this->sorted($filters['state'] === 'all' ? $rows : $rows->where('state', $filters['state']), $filters['sort']),
            'counts' => ExternalRequestsReport::counts($rows),
            'filters' => $filters,
            'officeName' => session('user')['office']['officeName'] ?? '',
        ]);
    }

    protected function rows(array $filters, ExternalRequestsReport $report, ApiService $api): Collection
    {
        return $report->rows(
            session('user')['office']['id'],
            $filters,
            collect($api->getOfficesData()['officeList'] ?? [])->keyBy('id'),
            collect($api->getEmployeesData()['employeesList'] ?? [])->keyBy('id'),
        );
    }

    protected function sorted(Collection $rows, string $sort): Collection
    {
        return match ($sort) {
            'created_at' => $rows->reverse()->values(),
            // Fewest working days left first; completed (no deadline left) last.
            'remaining' => $rows->sortBy(fn (array $row) => $row['remaining'] ?? PHP_INT_MAX)->values(),
            default => $rows->values(),
        };
    }

    /** @return array{state: string, search: string, from: string|null, to: string|null, sort: string, per_page: int} */
    protected function filters(Request $request): array
    {
        $perPage = (int) $request->query('per_page', self::PER_PAGE);
        $state = $request->query('state');

        return [
            'state' => in_array($state, ExternalRequestsReport::STATES, true) ? $state : 'all',
            'search' => trim((string) $request->query('search', '')),
            ...self::dateRange($request),
            'sort' => in_array($request->query('sort'), self::SORTS, true) ? $request->query('sort') : self::SORTS[0],
            'per_page' => in_array($perPage, self::PER_PAGE_OPTIONS, true) ? $perPage : self::PER_PAGE,
        ];
    }
}
