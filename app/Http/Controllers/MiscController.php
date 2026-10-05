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
                $query->with(['action', 'user'])->orderBy('created_at', 'asc');
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
        // Default to the current month, as the on-screen report opens.
        $startDate = $request->query('startDate') ?: now()->startOfMonth()->toDateString();
        $endDate = $request->query('endDate') ?: now()->toDateString();

        $data = $report->handle($startDate, $endDate, $api->getActiveOffices());

        $reportData = [
            'overall' => $data['totals'],
            // The print view reads the office name from `office`.
            'offices' => array_map(fn (array $row) => [...$row, 'office' => ['officeName' => $row['name']]], $data['offices']),
        ];

        return view('reports.document-status-print', compact('reportData', 'startDate', 'endDate'));
    }

    public function printExternalDocumentsReport(Request $request)
    {
        $startDate = $request->get('startDate');
        $endDate = $request->get('endDate');
        
        // Default to last 30 days if no dates provided
        if (!$startDate || !$endDate) {
            $startDate = now()->subMonth(1)->format('Y-m-d');
            $endDate = now()->format('Y-m-d');
        }

        // Load offices data
        $this->mount();

        /**
         * The selected range, inclusive of both days the user picked, and shared by
         * every query below so the summary cards and the per-office table cannot
         * disagree. This matches the on-screen report in
         * App\Livewire\Report\ExternalDocuments, which filters on the date part of
         * created_at — previously the printed copy shifted the whole window forward
         * a day and quietly reported different totals than the screen it was
         * printed from.
         */
        $rangeStart = \Carbon\Carbon::parse($startDate)->startOfDay();
        $rangeEnd = \Carbon\Carbon::parse($endDate)->addDay()->startOfDay();

        // Generate overall statistics for external documents
        $reportData['overall'] = [
            'incoming' => Document::where('source', 'external')
                ->whereIn('status', ['For Receiving', 'Returned'])
                ->whereBetween('created_at', [$rangeStart, $rangeEnd])->count(),
            'pending' => Document::where('source', 'external')
                ->whereIn('status', ['On Process'])
                ->whereBetween('created_at', [$rangeStart, $rangeEnd])->count(),
            'processed' => Document::where('source', 'external')
                ->whereNull('bundle_id')
                ->whereHas('logs', function ($query) {
                    $query->whereIn('action_id', [3, 5]);
                })
                ->whereBetween('created_at', [$rangeStart, $rangeEnd])->count(),
        ];

        // Generate office-wise data for external documents. Pre-aggregate the
        // counts in three grouped queries instead of 3 count queries per office.
        $incomingByOffice = Document::where('source', 'external')
            ->whereIn('status', ['For Receiving', 'Returned'])
            ->whereBetween('created_at', [$rangeStart, $rangeEnd])
            ->selectRaw('assigned_to, COUNT(*) as aggregate')
            ->groupBy('assigned_to')
            ->pluck('aggregate', 'assigned_to');

        $pendingByOffice = Document::where('source', 'external')
            ->where('status', 'On Process')
            ->whereBetween('created_at', [$rangeStart, $rangeEnd])
            ->selectRaw('assigned_to, COUNT(*) as aggregate')
            ->groupBy('assigned_to')
            ->pluck('aggregate', 'assigned_to');

        $processedByOffice = Document::where('source', 'external')
            ->whereHas('logs', function ($query) {
                $query->whereIn('action_id', [3, 5]);
            })
            ->whereBetween('created_at', [$rangeStart, $rangeEnd])
            ->selectRaw('assigned_to, COUNT(*) as aggregate')
            ->groupBy('assigned_to')
            ->pluck('aggregate', 'assigned_to');

        $reportData['offices'] = [];
        foreach ($this->offices as $office) {
            // Report lists active offices only; $this->offices stays unfiltered
            // because filterOffice() must still resolve deactivated offices.
            if (!($office['status'] ?? true)) {
                continue;
            }

            $incoming = $incomingByOffice[$office['id']] ?? 0;
            $pending = $pendingByOffice[$office['id']] ?? 0;
            $processed = $processedByOffice[$office['id']] ?? 0;

            $total = $incoming + $pending + $processed;
            $percentage = $processed && $total > 0 ? ($processed / $total) * 100 : 0;

            $reportData['offices'][] = [
                'office' => $office,
                'incoming' => $incoming,
                'pending' => $pending,
                'processed' => $processed,
                'percentage' => $percentage
            ];
        }

        // Sort offices by name
        $reportData['offices'] = collect($reportData['offices'])->sortBy(function ($item) {
            return $item['office']['officeName'];
        })->values()->toArray();

        return view('reports.external-documents-print', compact('reportData', 'startDate', 'endDate'));
    }    
}
