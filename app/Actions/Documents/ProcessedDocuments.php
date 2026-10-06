<?php

namespace App\Actions\Documents;

use App\Models\Action;
use App\Models\Document;
use App\Support\DocumentTypes;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Documents an office forwarded on: one row per document, dated by its latest
 * forward from here. Documents the office closed are left out (they are in
 * Closed), so the two pages never overlap; one forwarded here and closed
 * elsewhere later still counts. Bundle contents travel with their bundle, so
 * only top-level documents are listed. Replaces Livewire Status\Forwarded.
 */
class ProcessedDocuments
{
    /** Where a processed document can be now, in workflow order. */
    public const STATUSES = ['Created', 'For Receiving', 'On Process', 'Returned', 'Closed'];

    /** Only these go into an electronic logbook: forwarded and not yet received. */
    public const LOGBOOK_STATUS = 'For Receiving';

    /**
     * @param  array{type?: string, search?: string|null, statuses?: list<string>, from?: string|null, to?: string|null}  $filters
     */
    public function query(int|string $officeId, array $filters = []): Builder
    {
        $search = trim((string) ($filters['search'] ?? ''));
        $statuses = array_values(array_intersect($filters['statuses'] ?? [], self::STATUSES));
        $from = ($filters['from'] ?? null) ? Carbon::parse($filters['from'])->startOfDay() : null;
        $to = ($filters['to'] ?? null) ? Carbon::parse($filters['to'])->endOfDay() : null;

        return DocumentTypes::apply(Document::query(), DocumentTypes::normalize($filters['type'] ?? null))
            // Each document's latest forward from here, joined once. Looking it up
            // per document instead (a correlated subquery for the filter, the sort
            // and each column) took ~4.5 s for a busy office over a year; this ~0.2 s.
            ->joinSub($this->latestSteps($officeId), 'last_step', 'last_step.document_id', '=', 'documents.id')
            ->join('logs as latest_step', 'latest_step.id', '=', 'last_step.last_id')
            ->whereNull('documents.bundle_id')
            // Closed here: listed under Closed instead.
            ->whereNotExists($this->closedHere($officeId))
            ->when($search !== '', fn (Builder $query) => $query->where(function (Builder $where) use ($search) {
                $where->where('documents.control_no', 'like', "%{$search}%")
                    ->orWhere('documents.subject', 'like', "%{$search}%");
            }))
            ->when($statuses, fn (Builder $query) => $query->whereIn('documents.status', $statuses))
            // On the date shown: its latest step here.
            ->when($from, fn (Builder $query) => $query->where('latest_step.created_at', '>=', $from))
            ->when($to, fn (Builder $query) => $query->where('latest_step.created_at', '<=', $to));
    }

    /**
     * Adds the latest step here: when (`processed_at`), by whom (`processed_by`)
     * and which (`processed_action`). The step is already joined by query().
     */
    public function withLatestStep(Builder $query, int|string $officeId): Builder
    {
        return $query->addSelect([
            'latest_step.created_at as processed_at',
            'latest_step.user_id as processed_by',
            'latest_step.action_id as processed_action',
        ]);
    }

    /**
     * Counts for the status filter and the type tabs; each ignores its own filter.
     *
     * @return array{statuses: array<string, int>, types: array<string, int>}
     */
    public function facets(int|string $officeId, array $filters): array
    {
        $statuses = $this->query($officeId, [...$filters, 'statuses' => []])->toBase()
            ->selectRaw('documents.status as value, count(*) as total')
            ->groupBy('documents.status')
            ->pluck('total', 'value');

        return [
            'statuses' => array_combine(self::STATUSES, array_map(fn ($status) => (int) ($statuses[$status] ?? 0), self::STATUSES)),
            'types' => DocumentTypes::counts($this->query($officeId, [...$filters, 'type' => 'all'])),
        ];
    }

    /** @return array<int, string> Action id → name, for the step this page lists. */
    public function stepNames(): array
    {
        return array_flip(array_intersect_key($this->actionIds(), array_flip(['Forwarded'])));
    }

    /** Per document, the id of this office's latest Forwarded log (the highest id). */
    protected function latestSteps(int|string $officeId): QueryBuilder
    {
        return DB::table('logs')
            ->select('document_id')
            ->selectRaw('max(id) as last_id')
            ->where('assigned_to', $officeId)
            ->where('action_id', $this->actionIds()['Forwarded'])
            ->groupBy('document_id');
    }

    /** This office's Closed log on the outer document, if any. */
    protected function closedHere(int|string $officeId): QueryBuilder
    {
        return DB::table('logs as closed')
            ->whereColumn('closed.document_id', 'documents.id')
            ->where('closed.assigned_to', $officeId)
            ->where('closed.action_id', $this->actionIds()['Closed']);
    }

    /** @return array{Forwarded: int, Closed: int} */
    protected function actionIds(): array
    {
        $ids = once(fn () => Action::whereIn('name', ['Forwarded', 'Closed'])->pluck('id', 'name')->all());

        if (! isset($ids['Forwarded'], $ids['Closed'])) {
            throw new RuntimeException('The "Forwarded" or "Closed" action is missing from the actions table.');
        }

        return $ids;
    }
}
