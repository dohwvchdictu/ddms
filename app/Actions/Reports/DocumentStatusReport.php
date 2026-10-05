<?php

namespace App\Actions\Reports;

use App\Models\Document;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * The Status of Documents report: per office, what came in during a period,
 * how much of it has been finished, what is pending and what is overdue.
 * Shared by the on-screen report and its printed copy, so the two cannot
 * disagree. Ported from Livewire Report\DocumentStatus (and the copy of its
 * logic MiscController kept for printing).
 */
class DocumentStatusReport
{
    /**
     * Action ids. "Received" is what an office logs when it takes custody;
     * "Forwarded" and "Closed" are the two ways it finishes with a document.
     * Both sides of the completion rate are therefore log events over the same
     * date window, which is what makes the ratio meaningful.
     */
    private const ACTION_RECEIVED = 1;

    private const ACTION_FORWARDED = 3;

    private const ACTION_CLOSED = 5;

    private const ACTIONS_COMPLETED = [self::ACTION_FORWARDED, self::ACTION_CLOSED];

    /**
     * @param  string  $from  First day, `Y-m-d`, included.
     * @param  string  $to  Last day, `Y-m-d`, included.
     * @param  iterable<array<string, mixed>>  $offices  The offices to list (the active ones), from the HRIS directory.
     * @return array{totals: array{received: int, completed: int, pending: int, overdue: int, rate: float|null}, offices: list<array{id: int|string, name: string, code: string|null, received: int, completed: int, pending: int, overdue: int, rate: float|null}>}
     */
    public function handle(string $from, string $to, iterable $offices): array
    {
        /**
         * The selected range, inclusive of both days: from the start of `from`
         * up to (but not including) the day after `to`. The same window is used
         * by PerUnit, TurnaroundTime and the External Requests report.
         */
        $start = Carbon::parse($from)->startOfDay();
        $end = Carbon::parse($to)->addDay()->startOfDay();

        $pendingByOffice = Document::query()
            ->where('status', 'On Process')
            ->whereBetween('created_at', [$start, $end])
            ->selectRaw('assigned_to, COUNT(*) as aggregate')
            ->groupBy('assigned_to')
            ->pluck('aggregate', 'assigned_to');

        /**
         * Received and Completed both come from the custody-window walk rather
         * than from two independent COUNT(*)s, so Completed can never exceed
         * Received and the displayed rate is exactly Completed / Received.
         */
        $windows = $this->completionWindows($start, $end);
        $receivedByOffice = $windows['started'];
        $completedByOffice = $windows['finished'];
        $overdueByOffice = $this->overdueByOffice($start, $end);

        $rows = collect($offices)
            ->map(function (array $office) use ($receivedByOffice, $completedByOffice, $pendingByOffice, $overdueByOffice) {
                $received = (int) ($receivedByOffice[$office['id']] ?? 0);
                $completed = (int) ($completedByOffice[$office['id']] ?? 0);

                return [
                    'id' => $office['id'],
                    'name' => $office['officeName'] ?? '',
                    'code' => $office['officeCode'] ?? null,
                    'received' => $received,
                    'completed' => $completed,
                    'pending' => (int) ($pendingByOffice[$office['id']] ?? 0),
                    'overdue' => (int) ($overdueByOffice[$office['id']] ?? 0),
                    'rate' => self::completionRate($received, $completed),
                ];
            })
            ->sortBy('name', SORT_NATURAL | SORT_FLAG_CASE)
            ->values()
            ->all();

        /** Summed from the same per-office windows the table shows, so the cards reconcile. */
        $received = (int) $receivedByOffice->sum();
        $completed = (int) $completedByOffice->sum();

        return [
            'totals' => [
                'received' => $received,
                'completed' => $completed,
                'pending' => (int) $pendingByOffice->sum(),
                'overdue' => (int) $overdueByOffice->sum(),
                'rate' => self::completionRate($received, $completed),
            ],
            'offices' => $rows,
        ];
    }

    /**
     * Share of the documents an office took in that it also finished.
     *
     * Both terms come from completionWindows(), where every receipt is followed
     * to its own outcome, so $finished is by construction a subset of $started
     * and the result cannot exceed 100%. Null when nothing arrived: no intake
     * means no rate to report, which the views render as a dash rather than 0%.
     */
    public static function completionRate(int $started, int $finished): ?float
    {
        return $started > 0 ? ($finished / $started) * 100 : null;
    }

    /**
     * Per-office custody windows for the period, cached for a few minutes since
     * walking the log trail is the expensive part.
     *
     * @return array{started: Collection<int, int>, finished: Collection<int, int>}
     */
    private function completionWindows(Carbon $start, Carbon $end): array
    {
        $signature = md5(json_encode(['start' => $start->toDateTimeString(), 'end' => $end->toDateTimeString()]));

        return Cache::remember('document_status_windows_' . $signature, now()->addMinutes(5), fn () => $this->walkCompletionWindows($start, $end));
    }

    /**
     * Walk each document's log trail and pair every receipt with its outcome.
     *
     * A custody window opens when an office logs "Received" and closes on the
     * next "Forwarded" or "Closed". Only windows that *opened* inside the period
     * are counted, and a window counts as finished even if it closed after the
     * period ended — the question is how much of the work that arrived in this
     * period has since been dealt with, so a document received on the last day
     * of the range is not marked unfinished simply for being recent.
     *
     * There is deliberately no upper bound on the query: the closing log may sit
     * past the period end. Rows stream through a cursor to keep memory flat.
     *
     * @return array{started: Collection<int, int>, finished: Collection<int, int>}
     */
    private function walkCompletionWindows(Carbon $start, Carbon $end): array
    {
        $logs = DB::table('logs')
            ->whereIn('action_id', array_merge([self::ACTION_RECEIVED], self::ACTIONS_COMPLETED))
            ->where('created_at', '>=', $start)
            ->orderBy('document_id')
            ->orderBy('created_at')
            ->orderBy('id')
            ->select('document_id', 'assigned_to', 'action_id', 'created_at')
            ->cursor();

        /** Both sides are 'Y-m-d H:i:s', so a string compare avoids parsing every row. */
        $endAt = $end->toDateTimeString();

        $started = [];
        $finished = [];
        $currentDoc = null;
        $openWindow = null;

        foreach ($logs as $log) {
            $documentId = (int) $log->document_id;

            if ($documentId !== $currentDoc) {
                $currentDoc = $documentId;
                $openWindow = null;
            }

            if ((int) $log->action_id === self::ACTION_RECEIVED) {
                $officeId = (int) $log->assigned_to;

                /** Offices re-scan the same receipt in batches; that is not a new window. */
                if ($openWindow !== null && $openWindow['office'] === $officeId) {
                    continue;
                }

                /**
                 * A receipt by a different office abandons the window in progress
                 * — the document moved on without a Forwarded log, as Returned
                 * does — so it stays counted as started but never as finished.
                 */
                $inPeriod = $log->created_at < $endAt;
                $openWindow = ['office' => $officeId, 'in' => $inPeriod];

                if ($inPeriod) {
                    $started[$officeId] = ($started[$officeId] ?? 0) + 1;
                }

                continue;
            }

            /** Forwarded or Closed — the query admits nothing else — closes it. */
            if ($openWindow !== null) {
                if ($openWindow['in']) {
                    $finished[$openWindow['office']] = ($finished[$openWindow['office']] ?? 0) + 1;
                }

                $openWindow = null;
            }
        }

        return ['started' => collect($started), 'finished' => collect($finished)];
    }

    /**
     * Pending documents that have passed the deadline their service commitment
     * set, counted against the office now holding them.
     *
     * Overdue is a strict subset of the Pending column — same status and same
     * date window — narrowed to those whose deadline has passed. The deadline is
     * the created date plus the required days of the document's citizen charter,
     * or of its category when it has no charter: the same basis the dashboard
     * and the External Requests report use, so all three agree on "overdue".
     * The clock runs from creation (an end-to-end commitment), and the document
     * is charged to whoever holds it when the deadline passes. Weekends are
     * excluded, holidays are not.
     *
     * Working-day arithmetic cannot be expressed in portable SQL, so the query
     * groups by office, commitment and creation date first — every document in
     * a group shares one deadline, so the collapse is lossless — and PHP does
     * the date maths once per group.
     *
     * @return Collection<int|string, int>
     */
    private function overdueByOffice(Carbon $start, Carbon $end): Collection
    {
        /** A non-positive value counts as unset: a zero-day commitment would be overdue on arrival. */
        $requiredDays = 'case'
            . ' when citizen_charters.required_days > 0 then citizen_charters.required_days'
            . ' when categories.required_days > 0 then categories.required_days'
            . ' else ' . Document::DEFAULT_REQUIRED_DAYS
            . ' end';

        $groups = DB::table('documents')
            ->leftJoin('citizen_charters', 'citizen_charters.id', '=', 'documents.citizen_charter_id')
            ->leftJoin('categories', 'categories.id', '=', 'documents.category_id')
            ->where('documents.status', 'On Process')
            ->whereBetween('documents.created_at', [$start, $end])
            ->groupBy('documents.assigned_to', DB::raw($requiredDays), DB::raw('date(documents.created_at)'))
            ->select([
                'documents.assigned_to',
                DB::raw($requiredDays . ' as required_days'),
                DB::raw('date(documents.created_at) as created_date'),
                DB::raw('count(*) as documents'),
            ])
            ->get();

        $today = Carbon::today();
        $overdue = [];

        foreach ($groups as $group) {
            $dueDate = Carbon::parse($group->created_date)->startOfDay()->addWeekdays((int) $group->required_days);

            /** Signed working days to the deadline: >0 left, <0 overdue. */
            if ((int) $today->diffInWeekdays($dueDate, false) >= 0) {
                continue;
            }

            $overdue[$group->assigned_to] = ($overdue[$group->assigned_to] ?? 0) + (int) $group->documents;
        }

        return collect($overdue);
    }
}
