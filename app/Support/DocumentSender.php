<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

/** Who sent a document to an office: the last other office to log a step on it. */
class DocumentSender
{
    /** Adds `from_office_id` to a documents query, as one subquery instead of loading every row's logs. */
    public static function select(Builder $query, int|string $officeId): Builder
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
}
