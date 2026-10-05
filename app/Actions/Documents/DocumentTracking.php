<?php

namespace App\Actions\Documents;

use App\Models\Document;
use App\Services\ApiService;
use App\Support\DocumentTimeline;

/**
 * A document's summary and routing trail, shaped for the React tracking view.
 * The trail itself comes from DocumentTimeline, the same builder the Livewire
 * tracking modal and detail pages use, so the labelling rules stay in one place.
 */
class DocumentTracking
{
    public function __construct(protected ApiService $api)
    {
    }

    /**
     * @return array{document: array<string, mixed>, timeline: list<array<string, mixed>>}|null
     */
    public function handle(int $documentId): ?array
    {
        $document = Document::with(['category', 'citizencharter', 'logs' => function ($query) {
            $query->with('action')
                ->orderBy('created_at', 'desc')
                ->orderBy('id', 'desc'); // tiebreaker for entries sharing a timestamp (Forwarded + For Receiving)
        }])->find($documentId);

        if (!$document) {
            return null;
        }

        // Directory lookups are cached for hours by ApiService; keyed by id so
        // each timeline row is a hash lookup rather than a scan.
        $offices = collect($this->api->getOfficesData()['officeList'] ?? [])->keyBy('id');
        $employees = collect($this->api->getEmployeesData()['employeesList'] ?? [])->keyBy('id');

        $rows = DocumentTimeline::build(
            $document->logs,
            fn ($id) => $offices[$id]['officeName'] ?? null,
            function ($id) use ($employees) {
                $employee = $employees[$id] ?? null;

                return $employee
                    ? trim(($employee['firstName'] ?? '') . ' ' . ($employee['lastName'] ?? '') . ' ' . ($employee['suffix'] ?? ''))
                    : null;
            },
        );

        return [
            'document' => [
                'id' => $document->id,
                'control_no' => $document->control_no,
                'subject' => $document->subject,
                'classification' => $document->classification,
                'status' => $document->status,
                'turnaroundtime' => $document->turnaroundtime ?: null,
                'current_location' => DocumentTimeline::currentLocation($rows),
                'created_at' => $document->created_at?->toIso8601String(),
            ],
            'timeline' => array_map(fn (array $row) => [
                'key' => $row['key'],
                'action' => $row['action'],
                'color' => $row['color'],
                'created_at' => $row['created_at']?->toIso8601String(),
                'description' => $row['description'],
                'offices' => collect($row['offices'])
                    ->map(fn ($name, $label) => ['label' => $label, 'name' => $name])
                    ->values()
                    ->all(),
                'endorsed_to' => $row['endorsed_to'],
                'user' => $row['user'],
                'remarks' => $row['remarks'],
                'elapsed' => $row['elapsed'],
            ], $rows),
        ];
    }
}
