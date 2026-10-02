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
 * Documents an office has finished with: forwarded on or closed there. One
 * row per document, dated by its latest such step here. Bundle contents travel
 * with their bundle, so only top-level documents are listed. Replaces Livewire
 * Status\Forwarded.
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

        return DocumentTypes::apply(Document::query(), DocumentTypes::normalize($filters['type'] ?? null))
            ->whereNull('documents.bundle_id')
            ->whereExists($this->steps($officeId))
            ->when($search !== '', fn (Builder $query) => $query->where(function (Builder $where) use ($search) {
                $where->where('documents.control_no', 'like', "%{$search}%")
                    ->orWhere('documents.subject', 'like', "%{$search}%");
            }))
            ->when($statuses, fn (Builder $query) => $query->whereIn('documents.status', $statuses))
            // On the date shown: its latest step here.
            ->when($filters['from'] ?? null, fn (Builder $query, string $from) => $query->where($this->latest($officeId, 'created_at'), '>=', Carbon::parse($from)->startOfDay()))
            ->when($filters['to'] ?? null, fn (Builder $query, string $to) => $query->where($this->latest($officeId, 'created_at'), '<=', Carbon::parse($to)->endOfDay()));
    }

    /** Adds the latest step here: when (`processed_at`), by whom (`processed_by`) and which (`processed_action`). */
    public function withLatestStep(Builder $query, int|string $officeId): Builder
    {
        return $query->addSelect([
            'processed_at' => $this->latest($officeId, 'created_at'),
            'processed_by' => $this->latest($officeId, 'user_id'),
            'processed_action' => $this->latest($officeId, 'action_id'),
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

    /** @return array<int, string> Action id → name, for the steps this page lists. */
    public function stepNames(): array
    {
        return array_flip(array_intersect_key($this->actionIds(), array_flip(['Forwarded', 'Closed'])));
    }

    /** This office's Forwarded and Closed logs on the outer document. */
    protected function steps(int|string $officeId): QueryBuilder
    {
        $ids = $this->actionIds();

        return DB::table('logs')
            ->whereColumn('logs.document_id', 'documents.id')
            ->where('logs.assigned_to', $officeId)
            ->whereIn('logs.action_id', [$ids['Forwarded'], $ids['Closed']]);
    }

    protected function latest(int|string $officeId, string $column): QueryBuilder
    {
        return $this->steps($officeId)->select("logs.{$column}")->orderByDesc('logs.id')->limit(1);
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
