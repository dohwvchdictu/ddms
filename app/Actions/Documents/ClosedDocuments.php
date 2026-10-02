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
 * Documents an office closed: their route ended there. Dated by the close (the
 * latest, should one have been closed twice). Bundle contents close with their
 * bundle, so only top-level documents are listed. Replaces Livewire Status\Closed.
 */
class ClosedDocuments
{
    /**
     * @param  array{type?: string, search?: string|null, from?: string|null, to?: string|null}  $filters
     */
    public function query(int|string $officeId, array $filters = []): Builder
    {
        $search = trim((string) ($filters['search'] ?? ''));

        return DocumentTypes::apply(Document::query(), DocumentTypes::normalize($filters['type'] ?? null))
            ->whereNull('documents.bundle_id')
            ->whereExists($this->closes($officeId))
            ->when($search !== '', fn (Builder $query) => $query->where(function (Builder $where) use ($search) {
                $where->where('documents.control_no', 'like', "%{$search}%")
                    ->orWhere('documents.subject', 'like', "%{$search}%");
            }))
            ->when($filters['from'] ?? null, fn (Builder $query, string $from) => $query->where($this->latest($officeId, 'created_at'), '>=', Carbon::parse($from)->startOfDay()))
            ->when($filters['to'] ?? null, fn (Builder $query, string $to) => $query->where($this->latest($officeId, 'created_at'), '<=', Carbon::parse($to)->endOfDay()));
    }

    /** Adds the close: when (`closed_at`), by whom (`closed_by`) and why (`closed_remarks`). */
    public function withClose(Builder $query, int|string $officeId): Builder
    {
        return $query->addSelect([
            'closed_at' => $this->latest($officeId, 'created_at'),
            'closed_by' => $this->latest($officeId, 'user_id'),
            'closed_remarks' => $this->latest($officeId, 'remarks'),
        ]);
    }

    /**
     * Counts for the type tabs, under the other filters.
     *
     * @return array{types: array<string, int>}
     */
    public function facets(int|string $officeId, array $filters): array
    {
        return ['types' => DocumentTypes::counts($this->query($officeId, [...$filters, 'type' => 'all']))];
    }

    /** This office's Closed logs on the outer document. */
    protected function closes(int|string $officeId): QueryBuilder
    {
        return DB::table('logs')
            ->whereColumn('logs.document_id', 'documents.id')
            ->where('logs.assigned_to', $officeId)
            ->where('logs.action_id', $this->closedId());
    }

    protected function latest(int|string $officeId, string $column): QueryBuilder
    {
        return $this->closes($officeId)->select("logs.{$column}")->orderByDesc('logs.id')->limit(1);
    }

    protected function closedId(): int
    {
        return once(fn () => Action::where('name', 'Closed')->value('id'))
            ?? throw new RuntimeException('The "Closed" action is missing from the actions table.');
    }
}
