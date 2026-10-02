<?php

namespace App\Actions\Documents;

use App\Models\Action;
use App\Models\Log;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * What an office forwarded, one row per hand-over (its "For Receiving" log),
 * with whether the other office has received it yet. Bundle contents travel
 * with their bundle, so only the bundle is listed. Replaces Livewire
 * Views\RoutingLogbook.
 */
class RoutingLogbook
{
    /** Receipt states, as the tabs show them. */
    public const RECEIPTS = ['all', 'awaiting', 'received', 'returned'];

    /**
     * @param  array{receipt?: string, search?: string|null, from?: string|null, to?: string|null}  $filters
     */
    public function query(int|string $officeId, array $filters = []): Builder
    {
        $search = trim((string) ($filters['search'] ?? ''));

        $query = Log::query()
            ->join('documents', 'documents.id', '=', 'logs.document_id')
            ->where('logs.office_id', $officeId)
            ->where('logs.action_id', $this->actionId('For Receiving'))
            ->whereNull('logs.bundle_id')
            ->when($search !== '', fn (Builder $query) => $query->where(function (Builder $where) use ($search) {
                $where->where('documents.control_no', 'like', "%{$search}%")
                    ->orWhere('documents.subject', 'like', "%{$search}%");
            }))
            ->when($filters['from'] ?? null, fn (Builder $query, string $from) => $query->where('logs.created_at', '>=', Carbon::parse($from)->startOfDay()))
            ->when($filters['to'] ?? null, fn (Builder $query, string $to) => $query->where('logs.created_at', '<=', Carbon::parse($to)->endOfDay()));

        return match ($filters['receipt'] ?? 'all') {
            'received' => $query->whereExists($this->answer('Received')),
            'returned' => $query->whereNotExists($this->answer('Received'))->whereExists($this->answer('Returned')),
            'awaiting' => $query->whereNotExists($this->answer('Received'))->whereNotExists($this->answer('Returned')),
            default => $query,
        };
    }

    /**
     * Adds what the receiving office did with each hand-over: when it was
     * received and by whom, or when it was returned.
     */
    public function withReceipt(Builder $query): Builder
    {
        return $query->addSelect([
            'received_at' => $this->answer('Received')->select('answer.created_at')->orderBy('answer.id')->limit(1),
            'received_by' => $this->answer('Received')->select('answer.user_id')->orderBy('answer.id')->limit(1),
            'returned_at' => $this->answer('Returned')->select('answer.created_at')->orderBy('answer.id')->limit(1),
        ]);
    }

    /**
     * Counts for the receipt tabs, under the other filters.
     *
     * @return array<string, int>
     */
    public function counts(int|string $officeId, array $filters): array
    {
        return collect(self::RECEIPTS)
            ->mapWithKeys(fn (string $receipt) => [$receipt => $this->query($officeId, [...$filters, 'receipt' => $receipt])->count()])
            ->all();
    }

    /**
     * The receiving office's first answer of this kind to a hand-over: logged by
     * that office on the same document, at or after the hand-over. Matching on
     * time means a document forwarded to the same office twice gets each
     * receipt on its own row.
     */
    protected function answer(string $action): QueryBuilder
    {
        return DB::table('logs as answer')
            ->whereColumn('answer.document_id', 'logs.document_id')
            ->whereColumn('answer.office_id', 'logs.assigned_to')
            ->whereColumn('answer.created_at', '>=', 'logs.created_at')
            ->where('answer.action_id', $this->actionId($action));
    }

    protected function actionId(string $name): int
    {
        return once(fn () => Action::pluck('id', 'name')->all())[$name]
            ?? throw new RuntimeException("The \"{$name}\" action is missing from the actions table.");
    }
}
