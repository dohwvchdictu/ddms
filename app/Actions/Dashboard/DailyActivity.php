<?php

namespace App\Actions\Dashboard;

use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\DB;

/**
 * New and closed documents per day, system-wide, for the dashboard chart.
 *
 * Bundled children are left out on both sides, as everywhere on the
 * dashboard: they are created and closed with their parent bundle, so
 * counting them would report the same piece of work twice.
 */
class DailyActivity
{
    /** Name of the action logged when a document is closed. */
    private const CLOSED_ACTION = 'Closed';

    /**
     * @return list<array{date: string, created: int, closed: int}>  oldest first, every day present
     */
    public function handle(int $days = 30): array
    {
        $start = Carbon::today()->subDays($days - 1);

        $created = DB::table('documents')
            ->whereNull('bundle_id')
            ->where('created_at', '>=', $start)
            ->groupBy('day')
            ->selectRaw('date(created_at) as day, count(*) as total')
            ->pluck('total', 'day');

        // A document can be closed, reopened and closed again; count it once per day.
        $closed = DB::table('logs')
            ->join('actions', 'actions.id', '=', 'logs.action_id')
            ->join('documents', 'documents.id', '=', 'logs.document_id')
            ->where('actions.name', self::CLOSED_ACTION)
            ->whereNull('documents.bundle_id')
            ->where('logs.created_at', '>=', $start)
            ->groupBy('day')
            ->selectRaw('date(logs.created_at) as day, count(distinct logs.document_id) as total')
            ->pluck('total', 'day');

        $series = [];

        foreach (CarbonPeriod::create($start, Carbon::today()) as $day) {
            $key = $day->toDateString();
            $series[] = [
                'date' => $key,
                'created' => (int) ($created[$key] ?? 0),
                'closed' => (int) ($closed[$key] ?? 0),
            ];
        }

        return $series;
    }
}
