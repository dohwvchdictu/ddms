<?php

namespace App\Http\Controllers;

use App\Actions\Dashboard\DeadlineCounts;
use App\Models\Document;
use App\Services\ApiService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The documents behind a dashboard card (For Action, Pending, Due Soon,
 * Due Today, Overdue), searchable and paginated.
 */
class DashboardDocumentsController extends Controller
{
    public const PER_PAGE = 25;

    public function __invoke(Request $request, DeadlineCounts $deadlines, ApiService $api): Response
    {
        $filter = in_array($request->query('filter'), DeadlineCounts::FILTERS, true)
            ? $request->query('filter')
            : 'overdue';
        $search = trim((string) $request->query('search', ''));

        $query = $deadlines->documentsQuery($filter)->with(['category', 'citizencharter']);

        if ($search !== '') {
            $query->where(function ($where) use ($search) {
                $where->where('documents.subject', 'like', "%{$search}%")
                    ->orWhere('documents.control_no', 'like', "%{$search}%");
            });
        }

        // Oldest first: on every card, the longest-waiting documents matter most.
        $documents = $query->orderBy('documents.created_at')
            ->orderBy('documents.id')
            ->paginate(self::PER_PAGE)
            ->withQueryString();

        // Cached for hours by ApiService.
        $offices = collect($api->getOfficesData()['officeList'] ?? [])->keyBy('id');

        $documents->through(function (Document $document) use ($offices) {
            $due = DeadlineCounts::dueDate($document);

            return [
                'id' => $document->id,
                'control_no' => $document->control_no,
                'subject' => $document->subject,
                'classification' => $document->classification,
                'status' => $document->status,
                'office' => $offices[$document->assigned_to]['officeName'] ?? null,
                'created_at' => $document->created_at?->toIso8601String(),
                'due_date' => $due->toDateString(),
                'days_left' => DeadlineCounts::remainingDays($document->created_at, DeadlineCounts::requiredDays($document)),
            ];
        });

        return Inertia::render('dashboard/documents', [
            'filter' => $filter,
            'search' => $search,
            'documents' => $documents,
            'counts' => $deadlines->handle(),
        ]);
    }
}
