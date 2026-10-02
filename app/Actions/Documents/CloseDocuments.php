<?php

namespace App\Actions\Documents;

use App\Models\Action;
use App\Models\Document;
use App\Models\Log;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Closes documents on process here: the end of their route. Bundle contents
 * close with their bundle, and each records its turnaround time. Ported from
 * Livewire Status\Pending::close().
 */
class CloseDocuments
{
    public function __construct(protected PendingDocuments $pending)
    {
    }

    /**
     * @param  list<int>  $documentIds  Anything not on process here is skipped.
     * @param  array<string, mixed>  $user  The session employee.
     * @return int How many were closed.
     */
    public function handle(array $documentIds, array $user, string $officeName, string $remarks): int
    {
        $officeId = $user['office']['id'];
        $documents = $this->pending->actionable($officeId)->whereIn('documents.id', $documentIds)->get();

        if ($documents->isEmpty()) {
            return 0;
        }

        $closedId = Action::where('name', 'Closed')->value('id')
            ?? throw new RuntimeException('The "Closed" action is missing from the actions table.');
        $createdId = Action::where('name', 'Created')->value('id');

        DB::transaction(function () use ($documents, $officeId, $user, $officeName, $remarks, $closedId, $createdId) {
            foreach ($documents as $document) {
                $attachments = Document::where('assigned_to', $officeId)->where('status', 'On Process')->where('bundle_id', $document->id)->get();
                $type = $document->is_bundle ? 'Bundle' : 'Document';

                foreach ([$document, ...$attachments] as $closed) {
                    $closed->update(['status' => 'Closed']);

                    Log::create([
                        'action_id' => $closedId,
                        'document_id' => $closed->id,
                        'bundle_id' => $closed->is($document) ? null : $document->id,
                        'user_id' => $user['id'],
                        'office_id' => $officeId,
                        'assigned_to' => $officeId,
                        'description' => $closed->is($document)
                            ? "{$type} ({$document->control_no}) has been acted upon and closed by {$officeName}"
                            : "Bundle ({$document->control_no}) has been acted upon and closed by {$officeName}.",
                        'remarks' => $remarks,
                    ]);

                    $closed->update(['turnaroundtime' => self::turnaroundDays($closed->id, $createdId, $closedId)]);
                }
            }
        });

        return $documents->count();
    }

    /** Working days from its Created log to its Closed log; 0 when either is missing. */
    public static function turnaroundDays(int $documentId, ?int $createdId, int $closedId): int
    {
        $start = $createdId ? Log::where('document_id', $documentId)->where('action_id', $createdId)->oldest()->value('created_at') : null;
        $end = Log::where('document_id', $documentId)->where('action_id', $closedId)->latest()->value('created_at');

        if (! $start || ! $end) {
            return 0;
        }

        return (int) Carbon::parse($start)->diffInDaysFiltered(fn (Carbon $date) => ! $date->isWeekend(), Carbon::parse($end), true);
    }
}
