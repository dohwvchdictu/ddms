<?php

namespace App\Actions\Dashboard;

use App\Models\Document;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
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
    public const DEFAULT_REQUIRED_DAYS = Document::DEFAULT_REQUIRED_DAYS;

    /** Filters the dashboard cards link to; see documentsQuery(). */
    public const FILTERS = ['for_action', 'pending', 'due_soon', 'due_today', 'overdue'];

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

        foreach ($this->groups() as $group) {
            $documents = (int) $group->documents;

            $counts[in_array($group->status, self::FOR_ACTION_STATUSES, true) ? 'for_action' : 'pending'] += $documents;
            $counts[self::bucket(self::remainingDays($group->created_date, $group->required_days))] += $documents;
            $counts['total'] += $documents;
        }

        return $counts;
    }

    /**
     * The documents behind one card, as a query the list page can search and
     * paginate. The deadline cards cannot be filtered in SQL directly (the
     * working-day arithmetic is done in PHP), so the same lossless groups are
     * bucketed first, and the query then matches the (commitment, creation
     * date) pairs that landed in the chosen bucket.
     */
    public function documentsQuery(string $filter): Builder
    {
        $query = Document::query()
            ->select('documents.*')
            ->leftJoin('citizen_charters', 'citizen_charters.id', '=', 'documents.citizen_charter_id')
            ->leftJoin('categories', 'categories.id', '=', 'documents.category_id')
            ->whereNull('documents.bundle_id');

        if ($filter === 'for_action') {
            return $query->whereIn('documents.status', self::FOR_ACTION_STATUSES);
        }

        if ($filter === 'pending') {
            return $query->whereIn('documents.status', self::PENDING_STATUSES);
        }

        $query->whereIn('documents.status', array_merge(self::FOR_ACTION_STATUSES, self::PENDING_STATUSES));

        /** @var array<int, array<int, string>> $datesByDays  required days => creation dates */
        $datesByDays = [];

        foreach ($this->groups() as $group) {
            if (self::bucket(self::remainingDays($group->created_date, $group->required_days)) === $filter) {
                $datesByDays[(int) $group->required_days][$group->created_date] = $group->created_date;
            }
        }

        if ($datesByDays === []) {
            return $query->whereRaw('1 = 0');
        }

        return $query->where(function ($where) use ($datesByDays) {
            foreach ($datesByDays as $days => $dates) {
                $where->orWhere(function ($pair) use ($days, $dates) {
                    $pair->whereRaw(self::requiredDaysSql() . ' = ?', [$days])
                        ->whereIn(DB::raw('date(documents.created_at)'), array_values($dates));
                });
            }
        });
    }

    /** Deadline of one document: created date plus its commitment in working days. */
    public static function dueDate(Document $document): Carbon
    {
        return $document->created_at->copy()->startOfDay()->addWeekdays(self::requiredDays($document));
    }

    /** Signed working days to the deadline: >0 left, 0 today, <0 overdue. */
    public static function remainingDays(string|\DateTimeInterface $createdDate, int|string $requiredDays): int
    {
        $dueDate = Carbon::parse($createdDate)->startOfDay()->addWeekdays((int) $requiredDays);

        return (int) Carbon::today()->diffInWeekdays($dueDate, false);
    }

    /** Same rule as requiredDaysSql(), for a loaded model. */
    public static function requiredDays(Document $document): int
    {
        $charter = (int) ($document->citizencharter?->required_days ?? 0);
        $category = (int) ($document->category?->required_days ?? 0);

        return $charter > 0 ? $charter : ($category > 0 ? $category : self::DEFAULT_REQUIRED_DAYS);
    }

    private static function bucket(int $remaining): string
    {
        return match (true) {
            $remaining < 0 => 'overdue',
            $remaining === 0 => 'due_today',
            $remaining <= self::DUE_SOON_DAYS => 'due_soon',
            default => 'on_track',
        };
    }

    /**
     * The charter's required days win when it has a usable value, else the
     * category's, else the default. A non-positive value counts as unset: a
     * zero-day commitment would mark a document overdue the moment it was
     * encoded.
     */
    private static function requiredDaysSql(): string
    {
        return 'case'
            . ' when citizen_charters.required_days > 0 then citizen_charters.required_days'
            . ' when categories.required_days > 0 then categories.required_days'
            . ' else ' . self::DEFAULT_REQUIRED_DAYS
            . ' end';
    }

    /** Open documents grouped by status, deadline commitment and creation date. */
    private function groups(): Collection
    {
        $requiredDays = self::requiredDaysSql();

        return DB::table('documents')
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
    }
}
