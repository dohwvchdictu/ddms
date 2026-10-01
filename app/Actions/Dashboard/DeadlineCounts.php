<?php

namespace App\Actions\Dashboard;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Counts for the dashboard's action & deadline cards, over every document in
 * the system — no office, originator or date scoping of any kind. A date range
 * would hide the oldest documents, which are precisely the overdue ones these
 * cards exist to surface.
 *
 * Two views of one queue: "For Action" and "Pending" split it by what the
 * holding office must do next, while Due Soon / Due Today / Overdue cut the
 * same documents by how much time is left. A document therefore sits in one
 * card of each pair, and each pair sums to the whole queue.
 *
 * A document's deadline is its date created plus the required days of its
 * citizen charter, or of its document type when it has no charter — the same
 * basis the External Requests report already uses, so both screens agree.
 *
 * Scope notes:
 *
 * - Only open documents count. The cards are about work still owed, and a
 *   Closed document has no action pending and no deadline left to meet, so it
 *   belongs to none of them.
 * - Bundled children are excluded. They are received, forwarded and closed
 *   with their parent bundle, so counting them too would report the same piece
 *   of work twice.
 *
 * System-wide, this covers far too many rows to walk one model at a time, so
 * the database groups them by status, deadline commitment and creation date
 * first. Every document created on the same day under the same commitment
 * shares one deadline, which is why the grouping is lossless — it collapses
 * tens of thousands of rows into a few hundred, and the working-day arithmetic
 * PHP has to do runs once per group instead of once per document.
 */
class DeadlineCounts
{
    /** Awaiting receipt by the holding office. */
    public const FOR_ACTION_STATUSES = ['For Receiving', 'Returned'];

    /** Received and still in process at the holding office. */
    public const PENDING_STATUSES = ['On Process', 'Endorsed'];

    /** Working days of lead time that count as "Due Soon"; today is its own card. */
    public const DUE_SOON_DAYS = 3;

    /** Fallback when neither the citizen charter nor the category sets required_days. */
    public const DEFAULT_REQUIRED_DAYS = 20;

    /**
     * @return array{for_action: int, pending: int, due_soon: int, due_today: int, overdue: int, on_track: int, total: int}
     */
    public function handle(): array
    {
        $counts = [
            'for_action' => 0,
            'pending' => 0,
            'due_soon' => 0,
            'due_today' => 0,
            'overdue' => 0,
            'on_track' => 0,
            'total' => 0,
        ];

        /**
         * The charter's required days win when it has a usable value, else the
         * category's, else the default. A non-positive value counts as unset: a
         * zero-day commitment would mark a document overdue the moment it was
         * encoded.
         */
        $requiredDays = 'case'
            . ' when citizen_charters.required_days > 0 then citizen_charters.required_days'
            . ' when categories.required_days > 0 then categories.required_days'
            . ' else ' . self::DEFAULT_REQUIRED_DAYS
            . ' end';

        $groups = DB::table('documents')
            ->leftJoin('citizen_charters', 'citizen_charters.id', '=', 'documents.citizen_charter_id')
            ->leftJoin('categories', 'categories.id', '=', 'documents.category_id')
            ->whereNull('documents.bundle_id')
            ->whereIn('documents.status', array_merge(self::FOR_ACTION_STATUSES, self::PENDING_STATUSES))
            ->groupBy('documents.status', DB::raw($requiredDays), DB::raw('date(documents.created_at)'))
            ->select([
                'documents.status',
                DB::raw($requiredDays . ' as required_days'),
                DB::raw('date(documents.created_at) as created_date'),
                DB::raw('count(*) as documents'),
            ])
            ->get();

        $today = Carbon::today();

        foreach ($groups as $group) {
            $dueDate = Carbon::parse($group->created_date)->startOfDay()->addWeekdays((int) $group->required_days);

            /** Signed working days to the deadline: >0 left, <0 overdue */
            $remaining = (int) $today->diffInWeekdays($dueDate, false);

            $documents = (int) $group->documents;

            $counts[in_array($group->status, self::FOR_ACTION_STATUSES, true) ? 'for_action' : 'pending'] += $documents;

            if ($remaining < 0) {
                $counts['overdue'] += $documents;
            } elseif ($remaining === 0) {
                $counts['due_today'] += $documents;
            } elseif ($remaining <= self::DUE_SOON_DAYS) {
                $counts['due_soon'] += $documents;
            } else {
                $counts['on_track'] += $documents;
            }

            $counts['total'] += $documents;
        }

        return $counts;
    }
}
