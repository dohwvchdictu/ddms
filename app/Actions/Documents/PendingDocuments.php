<?php

namespace App\Actions\Documents;

use App\Models\Document;
use App\Support\DocumentTypes;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;

/**
 * Documents an office has received and is working on (On Process). Bundle
 * attachments travel with their bundle, so only top-level documents are listed.
 * Matches the sidebar's Pending badge. Ported from Livewire Status\Pending.
 */
class PendingDocuments
{
    /** What the office may act on, whatever the filters: forward, endorse and close check against this. */
    public function actionable(int|string $officeId): Builder
    {
        return Document::query()
            ->whereNull('documents.bundle_id')
            ->where('documents.assigned_to', $officeId)
            ->where('documents.status', 'On Process');
    }

    /**
     * @param  array{type?: string, search?: string|null, endorsed?: string|null, from?: string|null, to?: string|null}  $filters  `endorsed`: "me" or null.
     * @param  int|string|null  $employeeId  For the "endorsed to me" filter.
     */
    public function query(int|string $officeId, array $filters = [], int|string|null $employeeId = null): Builder
    {
        $search = trim((string) ($filters['search'] ?? ''));

        return DocumentTypes::apply($this->actionable($officeId), DocumentTypes::normalize($filters['type'] ?? null))
            ->when($search !== '', fn (Builder $query) => $query->where(function (Builder $where) use ($search) {
                $where->where('documents.control_no', 'like', "%{$search}%")
                    ->orWhere('documents.subject', 'like', "%{$search}%");
            }))
            ->when(($filters['endorsed'] ?? null) === 'me', fn (Builder $query) => $query->where('documents.endorsed_to', $employeeId))
            // The date of its last step here (received or endorsed).
            ->when($filters['from'] ?? null, fn (Builder $query, string $from) => $query->where('documents.updated_at', '>=', Carbon::parse($from)->startOfDay()))
            ->when($filters['to'] ?? null, fn (Builder $query, string $to) => $query->where('documents.updated_at', '<=', Carbon::parse($to)->endOfDay()));
    }

    /**
     * Counts for the type tabs and the "To me" switch; each ignores its own filter.
     *
     * @return array{types: array<string, int>, endorsed: array{me: int}}
     */
    public function facets(int|string $officeId, array $filters, int|string|null $employeeId): array
    {
        $everyone = [...$filters, 'endorsed' => null];

        return [
            'types' => DocumentTypes::counts($this->query($officeId, [...$filters, 'type' => 'all'], $employeeId)),
            'endorsed' => [
                'me' => $employeeId === null ? 0 : $this->query($officeId, $everyone, $employeeId)->where('documents.endorsed_to', $employeeId)->count(),
            ],
        ];
    }
}
