<?php

namespace App\Actions\Reports;

use App\Models\Action;
use App\Models\Document;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;

/**
 * Report › Endorsements: per employee of an office, the documents endorsed to
 * them still waiting (incoming) or on process (pending), and the ones they
 * finished (forwarded or closed), for documents created in a period. Ported
 * from Livewire Report\Employees.
 *
 * Differences from the Livewire report, on purpose:
 * - The period includes exactly the days picked. The old one also took in the
 *   day before the start and the day after the end.
 * - Incoming and pending count only what is held by this office.
 * - Bundle contents are counted with their bundle, not again on their own.
 */
class EndorsementReport
{
    public const INCOMING = ['For Receiving', 'Returned'];

    public const PENDING = ['On Process', 'Endorsed'];

    /**
     * @param  string  $from  First day, `Y-m-d`, included.
     * @param  string  $to  Last day, `Y-m-d`, included.
     * @param  iterable<array<string, mixed>>  $employees  The office's employees, from the HRIS directory.
     * @return array{totals: array{incoming: int, pending: int, processed: int, rate: float|null}, employees: list<array{id: int|string, name: string, incoming: int, pending: int, processed: int, rate: float|null}>}
     */
    public function handle(int|string $officeId, string $from, string $to, iterable $employees): array
    {
        $start = Carbon::parse($from)->startOfDay();
        $end = Carbon::parse($to)->addDay()->startOfDay();

        $endorsed = fn (array $statuses) => $this->created($start, $end)
            ->where('documents.assigned_to', $officeId)
            ->whereIn('documents.status', $statuses)
            ->whereNotNull('documents.endorsed_to')
            ->selectRaw('documents.endorsed_to as employee, COUNT(*) as aggregate')
            ->groupBy('documents.endorsed_to')
            ->pluck('aggregate', 'employee');

        $incoming = $endorsed(self::INCOMING);
        $pending = $endorsed(self::PENDING);

        // Finished here: this office's Forwarded and Closed steps, by whoever logged them.
        $processed = $this->created($start, $end)
            ->join('logs', 'logs.document_id', '=', 'documents.id')
            ->where('logs.assigned_to', $officeId)
            ->whereIn('logs.action_id', Action::whereIn('name', ['Forwarded', 'Closed'])->pluck('id'))
            ->selectRaw('logs.user_id as employee, COUNT(DISTINCT documents.id) as aggregate')
            ->groupBy('logs.user_id')
            ->pluck('aggregate', 'employee');

        $rows = collect($employees)
            ->map(function (array $employee) use ($incoming, $pending, $processed) {
                $row = [
                    'id' => $employee['id'],
                    // Last name first, as the Livewire report listed them.
                    'name' => trim(($employee['lastName'] ?? '') . ', ' . ($employee['firstName'] ?? '') . ' ' . ($employee['suffix'] ?? ''), ', '),
                    'incoming' => (int) ($incoming[$employee['id']] ?? 0),
                    'pending' => (int) ($pending[$employee['id']] ?? 0),
                    'processed' => (int) ($processed[$employee['id']] ?? 0),
                ];

                return [...$row, 'rate' => self::rate($row['incoming'], $row['pending'], $row['processed'])];
            })
            ->sortBy('name', SORT_NATURAL | SORT_FLAG_CASE)
            ->values();

        $totals = [
            'incoming' => (int) $rows->sum('incoming'),
            'pending' => (int) $rows->sum('pending'),
            'processed' => (int) $rows->sum('processed'),
        ];

        return [
            'totals' => [...$totals, 'rate' => self::rate($totals['incoming'], $totals['pending'], $totals['processed'])],
            'employees' => $rows->all(),
        ];
    }

    /**
     * Share of an employee's documents they finished: processed out of
     * everything (incoming + pending + processed). Null when they had none,
     * shown as a dash rather than 0%.
     */
    public static function rate(int $incoming, int $pending, int $processed): ?float
    {
        $total = $incoming + $pending + $processed;

        return $total > 0 ? ($processed / $total) * 100 : null;
    }

    /** Top-level documents created in the period. */
    protected function created(Carbon $start, Carbon $end): Builder
    {
        return Document::query()
            ->whereNull('documents.bundle_id')
            ->where('documents.created_at', '>=', $start)
            ->where('documents.created_at', '<', $end);
    }
}
