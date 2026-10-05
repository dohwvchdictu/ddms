<?php

namespace App\Actions\Reports;

use App\Models\Category;
use App\Models\CitizenCharter;
use App\Models\Document;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;

/**
 * Report › Per Unit: how many documents were encoded per procedure / category
 * in a period. Ported from Livewire Report\PerUnit, without its split into
 * purchase requests, payments and general (removed at the user's request).
 *
 * A Citizen's Charter transaction has no category, so it is counted under its
 * charter procedure, mirroring Document::classification.
 */
class PerUnitReport
{
    public const STATUSES = ['Created', 'For Receiving', 'On Process', 'Returned', 'Closed'];

    public const SOURCES = ['internal', 'external'];

    /**
     * @param  array{offices?: list<string>, sources?: list<string>, statuses?: list<string>, from?: string|null, to?: string|null}  $filters  Empty lists mean any.
     * @return array{total: int, rows: list<array{name: string, count: int}>, facets: array{offices: array<string, int>, sources: array<string, int>, statuses: array<string, int>}}
     */
    public function handle(array $filters): array
    {
        $categories = Category::pluck('name', 'id');
        $charters = CitizenCharter::pluck('name', 'id');

        $rows = $this->query($filters)
            ->selectRaw('category_id, CASE WHEN category_id IS NULL THEN citizen_charter_id END AS charter_id, COUNT(*) as total')
            ->groupBy('category_id', 'charter_id')
            ->get()
            ->map(fn ($row) => [
                'name' => $categories[$row->category_id] ?? $charters[$row->charter_id] ?? 'Uncategorized',
                'count' => (int) $row->total,
            ])
            // Most documents first; ties by name.
            ->sortBy([fn ($a, $b) => $b['count'] <=> $a['count'], fn ($a, $b) => strnatcasecmp($a['name'], $b['name'])])
            ->values();

        return [
            'total' => (int) $rows->sum('count'),
            'rows' => $rows->all(),
            'facets' => [
                'offices' => $this->counts($filters, 'offices', 'office_id'),
                'sources' => $this->counts($filters, 'sources', 'source'),
                'statuses' => $this->counts($filters, 'statuses', 'status'),
            ],
        ];
    }

    /** Documents matching the filters. */
    protected function query(array $filters): Builder
    {
        return Document::query()
            ->when($filters['offices'] ?? [], fn ($query, array $offices) => $query->whereIn('office_id', $offices))
            ->when($filters['sources'] ?? [], fn ($query, array $sources) => $query->whereIn('source', $sources))
            ->when($filters['statuses'] ?? [], fn ($query, array $statuses) => $query->whereIn('status', $statuses))
            ->when($filters['from'] ?? null, fn ($query, string $from) => $query->where('created_at', '>=', Carbon::parse($from)->startOfDay()))
            ->when($filters['to'] ?? null, fn ($query, string $to) => $query->where('created_at', '<=', Carbon::parse($to)->endOfDay()));
    }

    /**
     * A filter's live counts: how many documents each choice would show under
     * the other filters (its own is left out, so picking more stays possible).
     *
     * @return array<string, int>
     */
    protected function counts(array $filters, string $filter, string $column): array
    {
        return $this->query([...$filters, $filter => []])->toBase()
            ->selectRaw("{$column} as value, COUNT(*) as total")
            ->groupBy($column)
            ->pluck('total', 'value')
            ->mapWithKeys(fn ($total, $value) => [(string) $value => (int) $total])
            ->all();
    }
}
