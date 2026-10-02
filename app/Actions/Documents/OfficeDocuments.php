<?php

namespace App\Actions\Documents;

use App\Models\Document;
use App\Support\DocumentTypes;
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
    public const TYPES = DocumentTypes::TYPES;

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
        $type = DocumentTypes::normalize($filters['type'] ?? null);

        return DocumentTypes::apply(Document::query()->where('documents.office_id', $officeId), $type)
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
        $statuses = $this->query($officeId, [...$filters, 'statuses' => []])->toBase()
            ->selectRaw('documents.status as value, count(*) as total')
            ->groupBy('documents.status')
            ->pluck('total', 'value');

        return [
            // Every status, in workflow order, zeros included, so the list doesn't reshuffle.
            'statuses' => array_combine(self::STATUSES, array_map(fn ($status) => (int) ($statuses[$status] ?? 0), self::STATUSES)),
            'types' => DocumentTypes::counts($this->query($officeId, [...$filters, 'type' => 'all'])),
        ];
    }

    /** @return list<int> */
    public static function purchaseCategoryIds(): array
    {
        return DocumentTypes::purchaseCategoryIds();
    }

    /** @return list<int> */
    public static function paymentCategoryIds(): array
    {
        return DocumentTypes::paymentCategoryIds();
    }
}
