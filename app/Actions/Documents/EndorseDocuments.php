<?php

namespace App\Actions\Documents;

use App\Models\Action;
use App\Models\Document;
use App\Models\Log;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Hands documents on process here to someone in the same office, with a note.
 * Bundle contents go with their bundle. Ported from Livewire Status\Pending::endorse().
 */
class EndorseDocuments
{
    public function __construct(protected PendingDocuments $pending)
    {
    }

    /**
     * @param  list<int>  $documentIds  Anything not on process here is skipped, as is anything already endorsed to them.
     * @param  array<string, mixed>  $user  The session employee.
     * @param  array{id: int|string, name: string}  $to
     * @return int How many were endorsed.
     */
    public function handle(array $documentIds, array $user, array $to, string $remarks): int
    {
        $officeId = $user['office']['id'];

        $documents = $this->pending->actionable($officeId)
            ->whereIn('documents.id', $documentIds)
            // Already with them: nothing to record.
            ->where(fn ($where) => $where->whereNull('documents.endorsed_to')->orWhere('documents.endorsed_to', '!=', $to['id']))
            ->get();

        if ($documents->isEmpty()) {
            return 0;
        }

        $endorsedId = Action::where('name', 'Endorsed')->value('id')
            ?? throw new RuntimeException('The "Endorsed" action is missing from the actions table.');

        DB::transaction(function () use ($documents, $officeId, $user, $to, $remarks, $endorsedId) {
            foreach ($documents as $document) {
                $attachments = Document::where('assigned_to', $officeId)->where('status', 'On Process')->where('bundle_id', $document->id)->get();
                $type = $document->is_bundle ? 'Bundle' : 'Document';

                foreach ([$document, ...$attachments] as $endorsed) {
                    $endorsed->update(['endorsed_to' => $to['id'], 'status' => 'On Process']);

                    Log::create([
                        'action_id' => $endorsedId,
                        'document_id' => $endorsed->id,
                        'bundle_id' => $endorsed->is($document) ? null : $document->id,
                        'user_id' => $user['id'],
                        'office_id' => $officeId,
                        'assigned_to' => $officeId,
                        'endorsed_to' => $to['id'],
                        'description' => $endorsed->is($document)
                            ? "{$type} endorsed to {$to['name']} for appropriate action."
                            : "Bundle ({$document->control_no}) endorsed to {$to['name']} for appropriate action.",
                        'remarks' => $remarks,
                    ]);
                }
            }
        });

        return $documents->count();
    }
}
