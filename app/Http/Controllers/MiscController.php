<?php

namespace App\Http\Controllers;

use App\Actions\Reports\DocumentStatusReport;
use App\Models\Document;
use App\Services\ApiService;
use Illuminate\Http\Request;

class MiscController extends Controller
{
    /** The "Forwarded" action id: the logbook prints only what this office forwarded. */
    private const ACTION_FORWARDED = 3;

    public $user = [];
    public $id;
    public $office;
    public $offices = [];

    public function mount()
    {
        /** User Information */
        $this->user = session('user');
        $this->office = $this->user['office']['id'];
        /** End User Information */

        $this->checkApiConnection();
    }

    /**
     * The office directory, from ApiService's cache rather than a call to HRIS
     * on every print. An unreachable HRIS leaves it empty: the printouts still
     * render, with blank office names.
     */
    public function checkApiConnection(): bool
    {
        $offices = app(ApiService::class)->getOfficesData()['officeList'] ?? null;

        $this->offices = collect($offices ?? [])
            ->sortBy('officeName')
            ->values()
            ->all();

        return $offices !== null;
    }

    public function filterOffice($id)
    {
        if (!isset($id)) {
            return '';
        }

        $this->id = $id;

        $result = array_filter($this->offices, function ($office) {
            return $office['id'] == $this->id;
        });

        $result = array_values($result); // reindex array

        if (!isset($result[0])) {
            return '';
        }
        $findOffice = $result[0];
        return $findOffice['officeCode'] ?? '';
    }    

    public function generateLogbook(Request $request)
    {
        $selectedItemsParam = $request->query('selected_items', '');

        $selectedItems = [];
        if (!empty($selectedItemsParam)) {
            $selectedItems = array_values(array_filter(
                array_map('intval', explode(',', $selectedItemsParam)),
                fn($v) => $v > 0
            ));
        }

        $documentsData = [];
        $documentsArray = [];
        $offices = [];

        $documents = [];
        if (!empty($selectedItems)) {
            $documents = Document::with(['category', 'citizencharter', 'logs' => function ($query) {
                $query->with('action')->orderBy('created_at', 'asc');
            }])
                ->whereIn('id', $selectedItems)
                // Only what this office forwarded: the ids come from the URL, so
                // another office's documents could otherwise be printed.
                ->whereHas('logs', fn ($query) => $query
                    ->where('office_id', session('user')['office']['id'])
                    ->where('action_id', self::ACTION_FORWARDED))
                ->orderBy('created_at', 'desc')
                ->get();
        }

        // Load offices data
        $this->mount();

        // Merge documents with office information into documentsData
        foreach ($documents as $document) {
            $officeName = $this->filterOffice($document->assigned_to);
            
            $documentsData[] = [
                'document' => $document,
                'office_name' => $officeName,
                'assigned_to' => $document->assigned_to,
                'control_no' => $document->control_no,
                'subject' => $document->subject,
                'category' => $document->classification,
                'created_at' => $document->created_at,
                'status' => $document->status,
                'logs' => $document->logs
            ];
        }

        // Group documents by assigned_to after processing all documents
        $documentsArray = collect($documentsData)->groupBy('assigned_to');

        return view('print.logbook', compact('documentsArray', 'offices'));
    }

    /**
     * The printed Status of Documents report. Same figures as the on-screen
     * report: both come from AppActionsReportsDocumentStatusReport.
     */
    public function printDocumentStatusReport(Request $request, DocumentStatusReport $report, ApiService $api)
    {
        // Default to the last 30 days, as the on-screen report opens.
        $startDate = $request->query('startDate') ?: now()->subDays(29)->toDateString();
        $endDate = $request->query('endDate') ?: now()->toDateString();

        $data = $report->handle($startDate, $endDate, $api->getActiveOffices());

        $reportData = [
            'overall' => $data['totals'],
            // The print view reads the office name from `office`.
            'offices' => array_map(fn (array $row) => [...$row, 'office' => ['officeName' => $row['name']]], $data['offices']),
        ];

        return view('reports.document-status-print', compact('reportData', 'startDate', 'endDate'));
    }
}
