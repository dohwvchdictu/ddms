<?php

namespace App\Actions\Documents;

use App\Models\Category;
use App\Models\Document;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;

/**
 * The documents an office encoded, as listed on My Documents, with its filters.
 *
 * Purchase requests and payments have lists of their own, so they're left out
 * here. Ported from the Livewire MyDocumentsTable::baseQuery() it replaced.
 */
class OfficeDocuments
{
    /** The statuses a document can be in, in workflow order, for the filter. */
    public const STATUSES = ['Created', 'For Receiving', 'On Process', 'Returned', 'Closed'];

    /** Statuses that can be selected: Created to forward, For Receiving for the logbook. */
    public const SELECTABLE_STATUSES = ['Created', 'For Receiving'];

    /**
     * Whether a row gets a checkbox. A bundle's attachments travel with it, so
     * only top-level documents can be picked.
     */
    public static function isSelectable(Document $document): bool
    {
        return $document->bundle_id === null && in_array($document->status, self::SELECTABLE_STATUSES, true);
    }

    /** The rows that can be selected, among those matching the filters. */
    public function selectable(int|string $officeId, array $filters = []): Builder
    {
        return $this->query($officeId, $filters)
            ->whereNull('documents.bundle_id')
            ->whereIn('documents.status', self::SELECTABLE_STATUSES);
    }

    /** What may be forwarded: this office's own top-level documents, still Created. */
    public function forwardable(int|string $officeId): Builder
    {
        return $this->query($officeId)
            ->whereNull('documents.bundle_id')
            ->where('documents.status', 'Created');
    }

    /**
     * @param  array{search?: string|null, statuses?: list<string>, from?: string|null, to?: string|null}  $filters
     */
    public function query(int|string $officeId, array $filters = []): Builder
    {
        $search = trim((string) ($filters['search'] ?? ''));
        $statuses = array_values(array_intersect($filters['statuses'] ?? [], self::STATUSES));
        $separate = self::separatelyListedCategoryIds();

        return Document::query()
            ->where('documents.office_id', $officeId)
            ->when($separate, fn (Builder $query) => $query->where(function (Builder $where) use ($separate) {
                // NULL NOT IN (...) is never true in SQL, so uncategorised documents
                // (Citizen's Charter transactions) have to be let in explicitly.
                $where->whereNotIn('documents.category_id', $separate)->orWhereNull('documents.category_id');
            }))
            ->when($search !== '', fn (Builder $query) => $query->where(function (Builder $where) use ($search) {
                $where->where('documents.control_no', 'like', "%{$search}%")
                    ->orWhere('documents.subject', 'like', "%{$search}%");
            }))
            ->when($statuses, fn (Builder $query) => $query->whereIn('documents.status', $statuses))
            // Each bound on its own, so one blank date still filters sanely.
            ->when($filters['from'] ?? null, fn (Builder $query, string $from) => $query->where('documents.created_at', '>=', Carbon::parse($from)->startOfDay()))
            ->when($filters['to'] ?? null, fn (Builder $query, string $to) => $query->where('documents.created_at', '<=', Carbon::parse($to)->endOfDay()));
    }

    /**
     * How many documents each filter option would show. A facet is counted with
     * every *other* filter applied but not its own, so ticking "Created" doesn't
     * zero out the other statuses you could add.
     *
     * @return array{statuses: array<string, int>}
     */
    public function facets(int|string $officeId, array $filters): array
    {
        $statuses = $this->query($officeId, [...$filters, 'statuses' => []])->toBase()
            ->selectRaw('documents.status as value, count(*) as total')
            ->groupBy('documents.status')
            ->pluck('total', 'value');

        return [
            // Every status, in workflow order, zeros included, so the list doesn't reshuffle.
            'statuses' => array_combine(self::STATUSES, array_map(fn ($status) => (int) ($statuses[$status] ?? 0), self::STATUSES)),
        ];
    }

    /**
     * Purchase request and payment categories: they have their own lists.
     *
     * @return list<int>
     */
    public static function separatelyListedCategoryIds(): array
    {
        return Category::where('name', 'like', '%Payment%')
            ->orWhere('name', 'like', '%Purchase%')
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();
    }
}
