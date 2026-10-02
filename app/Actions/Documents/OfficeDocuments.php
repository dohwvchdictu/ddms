<?php

namespace App\Actions\Documents;

use App\Models\Category;
use App\Models\Document;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;

/**
 * The documents an office encoded, as listed on My Documents, with its filters.
 *
 * Purchase requests and payments are tabs of the same list (the `type` filter),
 * picked out by category name as the Livewire lists they replaced did. Ported
 * from Livewire MyDocumentsTable::baseQuery(), MyPurchaseRequests and MyPayments.
 */
class OfficeDocuments
{
    /** The statuses a document can be in, in workflow order, for the filter. */
    public const STATUSES = ['Created', 'For Receiving', 'On Process', 'Returned', 'Closed'];

    /** Statuses that can be selected: Created to forward, For Receiving for the logbook. */
    public const SELECTABLE_STATUSES = ['Created', 'For Receiving'];

    /** The list's tabs: everything, or one kind of document. */
    public const TYPES = ['all', 'documents', 'purchase_requests', 'payments'];

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
        return $this->query($officeId, ['type' => 'all'])
            ->whereNull('documents.bundle_id')
            ->where('documents.status', 'Created');
    }

    /**
     * @param  array{type?: string, search?: string|null, statuses?: list<string>, from?: string|null, to?: string|null}  $filters
     */
    public function query(int|string $officeId, array $filters = []): Builder
    {
        $search = trim((string) ($filters['search'] ?? ''));
        $statuses = array_values(array_intersect($filters['statuses'] ?? [], self::STATUSES));
        $type = in_array($filters['type'] ?? null, self::TYPES, true) ? $filters['type'] : 'all';

        return $this->ofType(Document::query()->where('documents.office_id', $officeId), $type)
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
     * @return array{statuses: array<string, int>, types: array<string, int>}
     */
    public function facets(int|string $officeId, array $filters): array
    {
        // One grouped count for the tabs; purchase is checked before payment, the
        // same precedence ofType() gives a category that matched both.
        $purchase = self::idList(self::purchaseCategoryIds());
        $payment = self::idList(self::paymentCategoryIds());
        $kinds = $this->query($officeId, [...$filters, 'type' => 'all'])->toBase()
            ->selectRaw("case
                when documents.category_id in ({$purchase}) then 'purchase_requests'
                when documents.category_id in ({$payment}) then 'payments'
                else 'documents' end as kind, count(*) as total")
            ->groupBy('kind')
            ->pluck('total', 'kind');

        $types = [
            'documents' => (int) ($kinds['documents'] ?? 0),
            'purchase_requests' => (int) ($kinds['purchase_requests'] ?? 0),
            'payments' => (int) ($kinds['payments'] ?? 0),
        ];

        $statuses = $this->query($officeId, [...$filters, 'statuses' => []])->toBase()
            ->selectRaw('documents.status as value, count(*) as total')
            ->groupBy('documents.status')
            ->pluck('total', 'value');

        return [
            // Every status, in workflow order, zeros included, so the list doesn't reshuffle.
            'statuses' => array_combine(self::STATUSES, array_map(fn ($status) => (int) ($statuses[$status] ?? 0), self::STATUSES)),
            'types' => ['all' => array_sum($types), ...$types],
        ];
    }

    /** Narrows a query to one tab's kind of document. */
    protected function ofType(Builder $query, string $type): Builder
    {
        $purchase = self::purchaseCategoryIds();
        $payment = array_values(array_diff(self::paymentCategoryIds(), $purchase));

        return match ($type) {
            'purchase_requests' => $query->whereIn('documents.category_id', $purchase ?: [0]),
            'payments' => $query->whereIn('documents.category_id', $payment ?: [0]),
            // NULL NOT IN (...) is never true in SQL, so uncategorised documents
            // (Citizen's Charter transactions) have to be let in explicitly.
            'documents' => $query->where(fn (Builder $where) => $where
                ->whereNotIn('documents.category_id', [...$purchase, ...$payment] ?: [0])
                ->orWhereNull('documents.category_id')),
            default => $query,
        };
    }

    /** @return list<int> */
    public static function purchaseCategoryIds(): array
    {
        return self::categoryIds('%Purchase%');
    }

    /** @return list<int> */
    public static function paymentCategoryIds(): array
    {
        return self::categoryIds('%Payment%');
    }

    /** @return list<int> */
    protected static function categoryIds(string $like): array
    {
        return Category::where('name', 'like', $like)->pluck('id')->map(fn ($id) => (int) $id)->all();
    }

    /** Integer ids for an SQL IN (...) list; never empty, which would be a syntax error. */
    protected static function idList(array $ids): string
    {
        return $ids ? implode(',', array_map('intval', $ids)) : '0';
    }
}
