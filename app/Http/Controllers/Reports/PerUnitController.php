<?php

namespace App\Http\Controllers\Reports;

use App\Actions\Reports\PerUnitReport;
use App\Http\Controllers\Concerns\ReadsListFilters;
use App\Http\Controllers\Controller;
use App\Services\ApiService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Report › Per Category: documents per procedure / category. Replaces Livewire Report\PerUnit. */
class PerUnitController extends Controller
{
    use ReadsListFilters;

    public function __invoke(Request $request, PerUnitReport $report, ApiService $api): Response
    {
        $offices = collect($api->getActiveOffices())
            ->map(fn (array $office) => ['id' => (string) $office['id'], 'name' => $office['officeName'] ?? '', 'code' => $office['officeCode'] ?? null])
            ->values();

        // Comma lists, each limited to the choices offered; empty means any.
        $filters = [
            'offices' => self::list($request, 'office', $offices->pluck('id')->all()),
            'sources' => self::list($request, 'source', PerUnitReport::SOURCES),
            'statuses' => self::list($request, 'status', PerUnitReport::STATUSES),
            ...self::dateRange($request),
        ];

        return Inertia::render('reports/per-unit', [
            'filters' => $filters,
            'defaultRange' => self::defaultRange(),
            // Deferred: the page opens with a skeleton and the report follows
            // (see TurnaroundController). Rescued: a failure offers a retry.
            'report' => Inertia::defer(fn () => $report->handle($filters), rescue: true),
            'offices' => $offices,
            'statusOptions' => PerUnitReport::STATUSES,
            'sourceOptions' => PerUnitReport::SOURCES,
        ]);
    }
}
