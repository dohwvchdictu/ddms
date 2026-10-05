<?php

namespace App\Http\Controllers\Reports;

use App\Actions\Reports\DocumentStatusReport;
use App\Http\Controllers\Concerns\ReadsListFilters;
use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Services\ApiService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Report › Status: documents per office for a period. Replaces Livewire Report\DocumentStatus. */
class DocumentStatusController extends Controller
{
    use ReadsListFilters;

    public function __invoke(Request $request, DocumentStatusReport $report, ApiService $api): Response
    {
        $range = self::dateRange($request);

        // The report needs both ends: an open start means since the first
        // document, an open end means today.
        $from = $range['from'] ?? substr((string) (Document::min('created_at') ?? now()), 0, 10);
        $to = $range['to'] ?? now()->toDateString();

        return Inertia::render('reports/status', [
            'filters' => $range,
            'defaultRange' => self::defaultRange(),
            'report' => $report->handle($from, $to, $api->getActiveOffices()),
            // The printed copy covers exactly the period on screen.
            'printUrl' => route('print.document.status', ['startDate' => $from, 'endDate' => $to]),
        ]);
    }
}
