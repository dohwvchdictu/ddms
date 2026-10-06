<?php

namespace App\Actions\Reports;

use App\Models\Category;
use App\Models\CitizenCharter;
use App\Models\Document;
use Carbon\Carbon;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Report › Turnaround Time: how long each office keeps a document, in working
 * days, for documents created in a period. Ported from Livewire
 * Report\TurnaroundTime; the hop rules are unchanged.
 *
 * A hop is one office's own custody window: it starts when that office logs
 * "Received" and ends when the document is logged "Forwarded". The office is
 * charged only for the time the document sat with it; the transit to the next
 * office is charged to nobody. "Closed" is the terminal fallback: a document
 * closed where it sits is never forwarded, so without it the last office in
 * every chain would never be measured.
 *
 * A receive is never a hop end. If the next office takes receipt while a hop
 * is still open, the document moved without a "Forwarded" log (which is what
 * "Endorsed" and "Returned" do), and that open hop is abandoned rather than
 * measured, with the clock restarting at the new office. "For Receiving" is
 * ignored: it marks a document in transit, not in anyone's custody. The origin
 * office only "Created" the document, so it is never a hop start.
 */
class TurnaroundReport
{
    private const ACTION_RECEIVED = 1;

    private const ACTION_FORWARDED = 3;

    private const ACTION_CLOSED = 5;

    private const HOP_BOUNDARIES = [self::ACTION_RECEIVED, self::ACTION_FORWARDED, self::ACTION_CLOSED];

    public const SOURCES = ['internal', 'external'];

    /** Bucket key for a document with neither a category nor a charter procedure. */
    private const CLASSIFICATION_NONE = 'x';

    /** "Y-m-d H:i:s" (fractional seconds allowed), as the logs store it. */
    private const DATETIME = '/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2}(?:\.\d+)?)$/';

    /**
     * Per-office dwell, and the summary across the offices shown.
     *
     * @param  array{offices?: list<string>, sources?: list<string>, from: string, to: string}  $filters  `offices` narrows the rows (and summary), not the walk.
     * @param  array<int|string, string>  $officeNames  Every office, active or not, so a since-closed office still resolves.
     * @return array{summary: array{documents: int, total: int, average: float|null, fastest: int|null, slowest: int|null}, offices: list<array{id: int, name: string, hops: int, avg: float|null, min: int|null, max: int|null}>, facets: array{offices: array<string, int>}}
     */
    public function handle(array $filters, array $officeNames): array
    {
        $data = $this->dwell($filters);
        $selected = array_map('strval', $filters['offices'] ?? []);

        $rows = collect($data['offices'])
            ->map(fn (array $stats, $officeId) => [
                'id' => (int) $officeId,
                'name' => $officeNames[$officeId] ?? 'Office #' . $officeId,
                'hops' => $stats['count'],
                'avg' => self::average($stats),
                'min' => $stats['min'],
                'max' => $stats['max'],
                'sum' => $stats['sum'],
            ]);

        // Each office's hop count, for the Office filter's live counts.
        $facets = ['offices' => $rows->mapWithKeys(fn (array $row) => [(string) $row['id'] => $row['hops']])->all()];

        if ($selected !== []) {
            $rows = $rows->filter(fn (array $row) => in_array((string) $row['id'], $selected, true));
        }

        // With offices picked, the summary covers just them; otherwise every hop measured.
        $summary = $selected === []
            ? [
                'documents' => $data['documents'],
                'average' => self::average($data['overall']),
                'fastest' => $data['overall']['min'],
                'slowest' => $data['overall']['max'],
            ]
            : [
                'documents' => (int) $rows->sum('hops'),
                'average' => $rows->sum('hops') ? round($rows->sum('sum') / $rows->sum('hops'), 1) : null,
                'fastest' => $rows->min('min'),
                'slowest' => $rows->max('max'),
            ];

        return [
            'summary' => [...$summary, 'total' => $data['total']],
            'offices' => $rows->map(fn (array $row) => collect($row)->except('sum')->all())->sortBy('name', SORT_NATURAL | SORT_FLAG_CASE)->values()->all(),
            'facets' => $facets,
        ];
    }

    /**
     * One office's dwell per procedure / category: what kinds of document it
     * holds longest. Loaded when its row is expanded.
     *
     * @param  array{sources?: list<string>, from: string, to: string}  $filters
     * @return array{hops: int, categories: list<array{name: string, hops: int, avg: float|null, min: int, max: int}>}
     */
    public function office(int $officeId, array $filters): array
    {
        $signature = md5(json_encode([$officeId, $filters['sources'] ?? [], $filters['from'], $filters['to']]));

        $result = Cache::remember('turnaround_office_v5_' . $signature, now()->addMinutes(5), fn () => $this->walkOffice($officeId, $filters));
        $names = $this->classificationNames(array_keys($result['categories']));

        return [
            'hops' => $result['completed'],
            'categories' => collect($result['categories'])
                ->map(fn (array $stats, string $key) => [
                    'name' => $names[$key] ?? 'Uncategorized',
                    'hops' => $stats['count'],
                    'avg' => self::average($stats),
                    'min' => $stats['min'],
                    'max' => $stats['max'],
                ])
                // Slowest first: what this office keeps longest.
                ->sortByDesc('avg')
                ->values()
                ->all(),
        ];
    }

    /** @param  array{count: int, sum: int}  $stats */
    private static function average(array $stats): ?float
    {
        return $stats['count'] ? round($stats['sum'] / $stats['count'], 1) : null;
    }

    /**
     * Whole business days between two moments, weekends excluded: the same
     * count as Carbon's diffInDaysFiltered (each weekday from the start, a day
     * at a time, while still before the end, so the arrival day counts as 1),
     * worked out arithmetically. Carbon walking day by day was most of the
     * report's time over long ranges. Asia/Manila has no DST, so a day is
     * always the same wall-clock time a day later.
     */
    private static function businessDays(string $start, string $end): int
    {
        if (! preg_match(self::DATETIME, $start, $from) || ! preg_match(self::DATETIME, $end, $to)) {
            return self::businessDaysCarbon($start, $end);
        }

        // Days stepped from the start that are still before the end.
        $days = self::epochDay($to[1]) - self::epochDay($from[1]) + ($from[2] < $to[2] ? 1 : 0);

        if ($days <= 0) {
            return 0;
        }

        // Whole weeks hold 5 working days; then the remaining days one by one.
        $weekday = (self::epochDay($from[1]) + 3) % 7; // 0 = Monday … 6 = Sunday
        $count = intdiv($days, 7) * 5;

        for ($i = 0, $rest = $days % 7; $i < $rest; $i++) {
            if (($weekday + $i) % 7 < 5) {
                $count++;
            }
        }

        return $count;
    }

    /** Days since 1970-01-01 for a "Y-m-d" date; memoized, since logs share dates. */
    private static function epochDay(string $date): int
    {
        static $days = [];

        return $days[$date] ??= intdiv((int) strtotime($date . ' 00:00:00 UTC'), 86400);
    }

    /** The original Carbon count, kept for any timestamp the fast path does not recognize. */
    private static function businessDaysCarbon(string $start, string $end): int
    {
        $from = Carbon::parse($start);
        $to = Carbon::parse($end);

        if ($to->lessThanOrEqualTo($from)) {
            return 0;
        }

        return (int) $from->diffInDaysFiltered(fn (Carbon $date) => ! $date->isWeekend(), $to);
    }

    /** Hop boundary logs of the documents in scope (source, created in the period), in trail order. */
    private function hopLogs(array $filters): Builder
    {
        return DB::table('logs')
            ->join('documents', 'documents.id', '=', 'logs.document_id')
            ->whereIn('logs.action_id', self::HOP_BOUNDARIES)
            ->when($filters['sources'] ?? [], fn ($query, array $sources) => $query->whereIn('documents.source', $sources))
            ->where('documents.created_at', '>=', Carbon::parse($filters['from'])->startOfDay())
            ->where('documents.created_at', '<', Carbon::parse($filters['to'])->addDay()->startOfDay())
            ->orderBy('logs.document_id')
            ->orderBy('logs.created_at')
            ->orderBy('logs.id')
            ->select('logs.document_id', 'logs.office_id', 'logs.action_id', 'logs.created_at');
    }

    /**
     * The walk over every in-scope document, cached a few minutes: only source
     * and dates drive it, so picking offices reuses it.
     *
     * @return array{offices: array<int, array{count: int, sum: int, min: int, max: int}>, total: int, documents: int, overall: array{count: int, sum: int, min: int|null, max: int|null}}
     */
    private function dwell(array $filters): array
    {
        $signature = md5(json_encode([$filters['sources'] ?? [], $filters['from'], $filters['to']]));

        return Cache::remember('turnaround_dwell_v4_' . $signature, now()->addMinutes(5), function () use ($filters) {
            $perOffice = [];
            $documentsWithHop = [];
            $overall = ['count' => 0, 'sum' => 0, 'min' => null, 'max' => null];

            $total = Document::query()
                ->when($filters['sources'] ?? [], fn ($query, array $sources) => $query->whereIn('source', $sources))
                ->where('created_at', '>=', Carbon::parse($filters['from'])->startOfDay())
                ->where('created_at', '<', Carbon::parse($filters['to'])->addDay()->startOfDay())
                ->count();

            if ($total > 0) {
                $this->walk($this->hopLogs($filters)->cursor(), function (int $office, int $documentId, int $days) use (&$perOffice, &$documentsWithHop, &$overall) {
                    $perOffice[$office] ??= ['count' => 0, 'sum' => 0, 'min' => $days, 'max' => $days];
                    $perOffice[$office]['count']++;
                    $perOffice[$office]['sum'] += $days;
                    $perOffice[$office]['min'] = min($perOffice[$office]['min'], $days);
                    $perOffice[$office]['max'] = max($perOffice[$office]['max'], $days);

                    $overall['count']++;
                    $overall['sum'] += $days;
                    $overall['min'] = $overall['min'] === null ? $days : min($overall['min'], $days);
                    $overall['max'] = $overall['max'] === null ? $days : max($overall['max'], $days);

                    $documentsWithHop[$documentId] = true;
                });
            }

            return ['offices' => $perOffice, 'total' => $total, 'documents' => count($documentsWithHop), 'overall' => $overall];
        });
    }

    /**
     * The per-category walk for one office: only documents it received are
     * walked, and only its own hops are credited.
     *
     * @return array{categories: array<string, array{count: int, sum: int, min: int, max: int}>, completed: int}
     */
    private function walkOffice(int $officeId, array $filters): array
    {
        $documentIds = (clone $this->hopLogs($filters))
            ->reorder()
            ->where('logs.office_id', $officeId)
            ->where('logs.action_id', self::ACTION_RECEIVED)
            ->distinct()
            ->pluck('logs.document_id');

        if ($documentIds->isEmpty()) {
            return ['categories' => [], 'completed' => 0];
        }

        /**
         * document_id => classification key. A Citizen's Charter transaction has
         * no category and is attributed to its charter procedure, mirroring
         * Document::classification. Prefixed so ids of the two cannot collide.
         */
        $classificationByDoc = Document::whereIn('id', $documentIds)
            ->get(['id', 'category_id', 'citizen_charter_id'])
            ->mapWithKeys(fn (Document $document) => [$document->id => match (true) {
                (bool) $document->category_id => 'c:' . $document->category_id,
                (bool) $document->citizen_charter_id => 'p:' . $document->citizen_charter_id,
                default => self::CLASSIFICATION_NONE,
            }]);

        $logs = DB::table('logs')
            ->whereIn('document_id', $documentIds)
            ->whereIn('action_id', self::HOP_BOUNDARIES)
            ->orderBy('document_id')
            ->orderBy('created_at')
            ->orderBy('id')
            ->select('document_id', 'office_id', 'action_id', 'created_at')
            ->cursor();

        $categories = [];
        $completed = 0;

        $this->walk($logs, function (int $office, int $documentId, int $days) use ($officeId, $classificationByDoc, &$categories, &$completed) {
            if ($office !== $officeId) {
                return;
            }

            $key = $classificationByDoc[$documentId] ?? self::CLASSIFICATION_NONE;
            $categories[$key] ??= ['count' => 0, 'sum' => 0, 'min' => $days, 'max' => $days];
            $categories[$key]['count']++;
            $categories[$key]['sum'] += $days;
            $categories[$key]['min'] = min($categories[$key]['min'], $days);
            $categories[$key]['max'] = max($categories[$key]['max'], $days);
            $completed++;
        });

        return ['categories' => $categories, 'completed' => $completed];
    }

    /**
     * Walk logs in trail order and report each completed hop to `$hop` as
     * (office, document, working days). Shared by both walks so they cannot
     * disagree on what a hop is.
     *
     * @param  iterable<object{document_id: int, office_id: int, action_id: int, created_at: string}>  $logs
     * @param  callable(int, int, int): void  $hop
     */
    private function walk(iterable $logs, callable $hop): void
    {
        $currentDoc = null;
        $open = null;

        foreach ($logs as $log) {
            $documentId = (int) $log->document_id;

            if ($documentId !== $currentDoc) {
                $currentDoc = $documentId;
                $open = null;
            }

            /**
             * A receive starts the clock for the receiving office. Repeat receives
             * by the office already holding it are batch rescans, not hand-offs;
             * a receive by another office abandons the open hop unmeasured.
             */
            if ((int) $log->action_id === self::ACTION_RECEIVED) {
                if ($open === null || $open['office'] !== (int) $log->office_id) {
                    $open = ['office' => (int) $log->office_id, 'time' => $log->created_at];
                }

                continue;
            }

            /** Forwarded or Closed (the query admits nothing else) ends the holder's window. */
            if ($open !== null) {
                $hop($open['office'], $documentId, self::businessDays($open['time'], $log->created_at));
                $open = null;
            }
        }
    }

    /**
     * Bucket keys back to names; a category row and a charter row can sit side
     * by side for the same office.
     *
     * @param  list<string>  $keys
     * @return array<string, string>
     */
    private function classificationNames(array $keys): array
    {
        $categories = Category::pluck('name', 'id');
        $charters = CitizenCharter::pluck('name', 'id');

        return collect($keys)->mapWithKeys(function (string $key) use ($categories, $charters) {
            [$kind, $id] = array_pad(explode(':', $key, 2), 2, null);

            return [$key => match ($kind) {
                'c' => $categories[$id] ?? 'Uncategorized',
                'p' => $charters[$id] ?? 'Uncategorized',
                default => 'Uncategorized',
            }];
        })->all();
    }
}
