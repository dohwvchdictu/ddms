<?php

namespace App\Http\Controllers\Reports;

use App\Actions\Reports\EndorsementReport;
use App\Http\Controllers\Concerns\ReadsListFilters;
use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Services\ApiService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Report › Endorsements: endorsed documents per employee of the user's office. Replaces Livewire Report\Employees. */
class EndorsementsController extends Controller
{
    use ReadsListFilters;

    public function __invoke(Request $request, EndorsementReport $report, ApiService $api): Response
    {
        $officeId = session('user')['office']['id'];
        $range = self::dateRange($request);

        // The report needs both ends: an open start means since the first document, an open end means today.
        $from = $range['from'] ?? substr((string) (Document::min('created_at') ?? now()), 0, 10);
        $to = $range['to'] ?? now()->toDateString();

        $employees = collect($api->getEmployeesData()['employeesList'] ?? [])
            ->filter(fn (array $employee) => (string) ($employee['office']['id'] ?? '') === (string) $officeId);

        return Inertia::render('reports/endorsements', [
            'filters' => $range,
            'defaultRange' => self::defaultRange(),
            'report' => $report->handle($officeId, $from, $to, $employees),
            'officeName' => session('user')['office']['officeName'] ?? null,
        ]);
    }
}
