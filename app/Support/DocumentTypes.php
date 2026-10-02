<?php

namespace App\Support;

use App\Models\Category;
use Illuminate\Contracts\Database\Query\Builder as QueryBuilder;
use Illuminate\Database\Eloquent\Builder;

/**
 * The kinds of document every list splits into as tabs: purchase requests and
 * payments (picked out by category name, as the Livewire lists did) and plain
 * documents, which include charter transactions with no category.
 */
class DocumentTypes
{
    public const TYPES = ['all', 'documents', 'purchase_requests', 'payments'];

    /** A valid type, or `all`. */
    public static function normalize(mixed $type): string
    {
        return in_array($type, self::TYPES, true) ? $type : 'all';
    }

    /** Narrows a document query to one kind. */
    public static function apply(Builder $query, string $type): Builder
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

    /**
     * Rows per kind for a query that is *not* narrowed by type, in one grouped
     * count. Purchase is checked before payment, the same precedence apply() gives
     * a category whose name matches both.
     *
     * @return array{all: int, documents: int, purchase_requests: int, payments: int}
     */
    public static function counts(Builder|QueryBuilder $query): array
    {
        $purchase = self::idList(self::purchaseCategoryIds());
        $payment = self::idList(self::paymentCategoryIds());

        $kinds = ($query instanceof Builder ? $query->toBase() : $query)
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

        return ['all' => array_sum($types), ...$types];
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
