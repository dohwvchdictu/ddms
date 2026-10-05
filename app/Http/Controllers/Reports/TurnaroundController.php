<?php

namespace App\Http\Controllers\Reports;

use App\Actions\Reports\TurnaroundReport;
use App\Http\Controllers\Concerns\ReadsListFilters;
use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Services\ApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Report › Turnaround Time: working days each office holds a document. Replaces Livewire Report\TurnaroundTime. */
class TurnaroundController extends Controller
{
    use ReadsListFilters;

    public function index(Request $request, TurnaroundReport $report, ApiService $api): Response
    {
        $filters = $this->filters($request, $api);
        // Every office, active or not, so documents that passed through a since-closed one still name it.
        $officeNames = collect($api->getOfficesData()['officeList'] ?? [])->pluck('officeName', 'id')->all();

        return Inertia::render('reports/turnaround', [
            'filters' => $filters['shown'],
            'defaultRange' => self::defaultRange(),
            'report' => $report->handle($filters['report'], $officeNames),
            'offices' => collect($api->getActiveOffices())
                ->map(fn (array $office) => ['id' => (string) $office['id'], 'name' => $office['officeName'] ?? ''])
                ->values(),
            'sourceOptions' => TurnaroundReport::SOURCES,
        ]);
    }

    /** One office's dwell per procedure / category, for its expanded row. */
    public function office(Request $request, int $office, TurnaroundReport $report, ApiService $api): JsonResponse
    {
        return response()->json($report->office($office, $this->filters($request, $api)['report']));
    }

    /**
     * The filters as the page shows them, and as the report needs them (both
     * dates set: an open start is the first document, an open end today).
     *
     * @return array{shown: array<string, mixed>, report: array<string, mixed>}
     */
    protected function filters(Request $request, ApiService $api): array
    {
        $range = self::dateRange($request);
        $shown = [
            'offices' => self::list($request, 'office', collect($api->getActiveOffices())->pluck('id')->map(fn ($id) => (string) $id)->all()),
            'sources' => self::list($request, 'source', TurnaroundReport::SOURCES),
            ...$range,
        ];

        return [
            'shown' => $shown,
            'report' => [
                ...$shown,
                'from' => $range['from'] ?? substr((string) (Document::min('created_at') ?? now()), 0, 10),
                'to' => $range['to'] ?? now()->toDateString(),
            ],
        ];
    }
}
