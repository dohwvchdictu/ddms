<?php

namespace App\Actions\Navigation;

use App\Models\Document;

/**
 * Badge counts for the sidebar's Status menu: documents held by an office
 * that still need something done. Bundled children travel with their bundle,
 * so they are not counted on their own. Same rules as the Livewire sidebar.
 */
class SidebarCounts
{
    /**
     * @return array{incoming: int, pending: int, endorsed: int, total: int}
     */
    public function handle(int|string $officeId, int|string|null $employeeId): array
    {
        $documents = Document::query()
            ->where('assigned_to', $officeId)
            ->whereIn('status', ['For Receiving', 'On Process', 'Returned'])
            ->whereNull('bundle_id')
            ->get(['status', 'endorsed_to']);

        return [
            'incoming' => $documents->whereIn('status', ['For Receiving', 'Returned'])->count(),
            'pending' => $documents->where('status', 'On Process')->count(),
            'endorsed' => $documents->where('status', 'On Process')->where('endorsed_to', $employeeId)->count(),
            'total' => $documents->count(),
        ];
    }
}
