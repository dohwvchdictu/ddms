<?php

namespace App\Actions\Documents;

use App\Models\Document;
use App\Support\DocumentTypes;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

/**
 * Documents waiting for an office to receive them: forwarded (For Receiving) or
 * sent back (Returned) to it. Bundle attachments travel with their bundle, so
 * only top-level documents are listed. Matches the sidebar's Incoming badge
 * (App\Actions\Navigation\SidebarCounts). Ported from Livewire Status\Incoming.
 */
class IncomingDocuments
{
    /** The statuses that mean "waiting to be received here". */
    public const STATUSES = ['For Receiving', 'Returned'];

    /**
     * What the office may receive, whatever the filters: receive() checks
     * against this, so a batch picked across several searches still goes through.
     */
    public function receivable(int|string $officeId): Builder
    {
        return Document::query()
            ->whereNull('documents.bundle_id')
            ->where('documents.assigned_to', $officeId)
            ->whereIn('documents.status', self::STATUSES);
    }

    /**
     * @param  array{type?: string, search?: string|null, statuses?: list<string>, from?: string|null, to?: string|null}  $filters
     */
    public function query(int|string $officeId, array $filters = []): Builder
    {
        $search = trim((string) ($filters['search'] ?? ''));
        $statuses = array_values(array_intersect($filters['statuses'] ?? [], self::STATUSES));

        return DocumentTypes::apply($this->receivable($officeId), DocumentTypes::normalize($filters['type'] ?? null))
            ->when($search !== '', fn (Builder $query) => $query->where(function (Builder $where) use ($search) {
                $where->where('documents.control_no', 'like', "%{$search}%")
                    ->orWhere('documents.subject', 'like', "%{$search}%");
            }))
            ->when($statuses, fn (Builder $query) => $query->whereIn('documents.status', $statuses))
            // The date it was sent here: its last change.
            ->when($filters['from'] ?? null, fn (Builder $query, string $from) => $query->where('documents.updated_at', '>=', Carbon::parse($from)->startOfDay()))
            ->when($filters['to'] ?? null, fn (Builder $query, string $to) => $query->where('documents.updated_at', '<=', Carbon::parse($to)->endOfDay()));
    }

    /**
     * Adds `from_office_id`: the last office other than this one to log a step,
     * i.e. who sent it here. One subquery instead of loading every row's logs.
     */
    public function withSender(Builder $query, int|string $officeId): Builder
    {
        return $query->addSelect([
            'from_office_id' => DB::table('logs')
                ->select('office_id')
                ->whereColumn('logs.document_id', 'documents.id')
                ->where('logs.office_id', '!=', $officeId)
                ->orderByDesc('logs.id')
                ->limit(1),
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
}
