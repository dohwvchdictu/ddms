<?php

namespace App\Actions\Documents;

use App\Models\Document;

/**
 * The categories an employee encoded most recently, newest first, so the
 * category picker can offer them before the full list. Most offices only ever
 * use a handful.
 */
class RecentCategories
{
    /** How far back to look: enough to find a few distinct categories, cheap to read. */
    protected const LOOKBACK = 100;

    /**
     * @return list<int>
     */
    public function handle(int|string $userId, int $limit = 5): array
    {
        return Document::where('user_id', $userId)
            ->whereNotNull('category_id')
            ->latest('id')
            ->limit(self::LOOKBACK)
            ->pluck('category_id')
            ->unique()
            ->take($limit)
            ->map(fn ($id) => (int) $id)
            ->values()
            ->all();
    }
}
