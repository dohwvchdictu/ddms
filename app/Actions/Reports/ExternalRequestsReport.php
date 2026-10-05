<?php

namespace App\Actions\Reports;

use App\Models\Action;
use App\Models\Document;
use Carbon\Carbon;
use Illuminate\Support\Collection;

/**
 * Report › External Requests: the external requests an office encoded in a
 * period, each with where it went, where it is now and how it stands against
 * its deadline. Shared by the screen and its printed copy. Ported from
 * Livewire Report\ExternalDocuments.
 *
 * Bundle contents are listed with their bundle, not again on their own.
 */
class ExternalRequestsReport
{
    /** Deadline states, most urgent first (the tabs' order). */
    public const STATES = ['overdue', 'due', 'pending', 'complete'];

    /** "Due" starts this many working days before the deadline. */
    public const DUE_SOON_DAYS = 2;

    /**
     * Every matching request, newest first, as rows; the deadline state is
     * worked out per row, so state filtering and counts happen on the result.
     *
     * @param  array{search?: string|null, from?: string|null, to?: string|null}  $filters
     * @param  Collection<int|string, array<string, mixed>>  $offices  The HRIS office directory, keyed by id.
     * @param  Collection<int|string, array<string, mixed>>  $employees  The HRIS employee directory, keyed by id.
     * @return Collection<int, array<string, mixed>>
     */
    public function rows(int|string $officeId, array $filters, Collection $offices, Collection $employees): Collection
    {
        $search = trim((string) ($filters['search'] ?? ''));
        $forReceivingId = Action::where('name', 'For Receiving')->value('id');

        $documents = Document::query()
            ->with([
                'category',
                'citizencharter',
                // Only the logs the row reads: the first hand-over and the latest remark.
                'logs' => fn ($query) => $query
                    ->where(fn ($where) => $where->where('action_id', $forReceivingId)->orWhereNotNull('remarks'))
                    ->orderBy('created_at'),
            ])
            ->where('source', 'external')
            ->where('office_id', $officeId)
            ->whereNull('bundle_id')
            ->when($search !== '', fn ($query) => $query->where(fn ($where) => $where
                ->where('control_no', 'like', "%{$search}%")
                ->orWhere('subject', 'like', "%{$search}%")))
            ->when($filters['from'] ?? null, fn ($query, string $from) => $query->where('created_at', '>=', Carbon::parse($from)->startOfDay()))
            ->when($filters['to'] ?? null, fn ($query, string $to) => $query->where('created_at', '<=', Carbon::parse($to)->endOfDay()))
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get();

        $office = fn ($id) => $id ? ['code' => $offices[$id]['officeCode'] ?? null, 'name' => $offices[$id]['officeName'] ?? null] : null;

        return $documents->map(function (Document $document) use ($forReceivingId, $office, $employees) {
            $encoder = $employees[$document->user_id] ?? null;
            // The first office it was routed to: the earliest "For Receiving" (the
            // "Forwarded" log points back at the sender, not the destination).
            $firstStop = $document->logs->firstWhere('action_id', $forReceivingId);
            $remark = $document->logs->whereNotNull('remarks')->filter(fn ($log) => trim((string) $log->remarks) !== '')->last();

            return [
                'id' => $document->id,
                'control_no' => $document->control_no,
                'subject' => $document->subject,
                'classification' => $document->classification,
                'status' => $document->status,
                'is_bundle' => (bool) $document->is_bundle,
                'created_at' => $document->created_at?->toIso8601String(),
                'encoded_by' => $encoder ? trim(($encoder['firstName'] ?? '') . ' ' . ($encoder['lastName'] ?? '') . ' ' . ($encoder['suffix'] ?? '')) : null,
                'origin' => $office($document->office_id),
                'first_destination' => $firstStop ? $office($firstStop->assigned_to) : null,
                'now_at' => $office($document->assigned_to ?? $document->office_id),
                'remarks' => $remark?->remarks,
                ...self::deadline($document),
            ];
        });
    }

    /** @return array<string, int> Rows per deadline state, plus `all`. */
    public static function counts(Collection $rows): array
    {
        return ['all' => $rows->count(), ...collect(self::STATES)->mapWithKeys(fn ($state) => [$state => $rows->where('state', $state)->count()])->all()];
    }

    /**
     * Where a request stands against its deadline: the created date plus its
     * required days (charter, else category, else the default), counted in
     * working days (weekends excluded, holidays not).
     *
     * complete = closed · overdue = past the deadline · due = today or within
     * DUE_SOON_DAYS working days · pending = still in process, not yet near.
     *
     * @return array{required_days: int, remaining: int|null, state: string, deadline_label: string}
     */
    public static function deadline(Document $document): array
    {
        $requiredDays = (int) $document->required_days;

        if ($document->status === 'Closed') {
            return ['required_days' => $requiredDays, 'remaining' => null, 'state' => 'complete', 'deadline_label' => 'Completed'];
        }

        $dueDate = $document->created_at->copy()->startOfDay()->addWeekdays($requiredDays);
        /** Signed working days between today and the deadline: >0 left, <0 overdue. */
        $remaining = (int) Carbon::today()->diffInWeekdays($dueDate, false);
        $days = fn (int $n) => $n . ' ' . ($n === 1 ? 'day' : 'days');

        [$state, $label] = match (true) {
            $remaining < 0 => ['overdue', $days(abs($remaining)) . ' overdue'],
            $remaining === 0 => ['due', 'Due today'],
            $remaining <= self::DUE_SOON_DAYS => ['due', 'Due in ' . $days($remaining)],
            default => ['pending', $days($remaining) . ' left'],
        };

        return ['required_days' => $requiredDays, 'remaining' => $remaining, 'state' => $state, 'deadline_label' => $label];
    }
}
