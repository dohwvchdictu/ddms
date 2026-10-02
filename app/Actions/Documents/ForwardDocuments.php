<?php

namespace App\Actions\Documents;

use App\Models\Action;
use App\Models\Document;
use App\Models\Log;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Sends an office's newly encoded documents (and, for a bundle, the documents
 * attached to it) to another office, logging "Forwarded" here and "For
 * Receiving" there. Ported from the Livewire MyDocumentsTable::forward() it replaced.
 */
class ForwardDocuments
{
    public function __construct(protected OfficeDocuments $officeDocuments)
    {
    }

    /**
     * @param  list<int>  $documentIds  Anything not forwardable by this office is skipped.
     * @param  array<string, mixed>  $user  The session employee.
     * @param  array{id: int|string, name: string}  $destination
     * @param  Builder|null  $eligible  Which documents may go: by default this office's own new ones
     *                               (My Documents); Pending passes the ones on process here.
     * @return int How many documents were forwarded (bundles count once).
     */
    public function handle(array $documentIds, array $user, array $destination, int|string|null $endorsedTo, ?string $remarks, ?Builder $eligible = null): int
    {
        $officeId = $user['office']['id'];

        // Re-checked here rather than trusted from the form: still eligible, and a
        // top-level document rather than an attachment.
        $documents = ($eligible ?? $this->officeDocuments->forwardable($officeId))
            ->whereIn('documents.id', $documentIds)
            ->get();

        if ($documents->isEmpty()) {
            return 0;
        }

        $forwardedId = Action::where('name', 'Forwarded')->value('id');
        $receivingId = Action::where('name', 'For Receiving')->value('id');

        if (! $forwardedId || ! $receivingId) {
            throw new RuntimeException('The "Forwarded" or "For Receiving" action is missing from the actions table.');
        }

        $log = fn (Document $document, ?int $bundleId, int $actionId, int|string $assignedTo, string $description) => Log::create([
            'action_id' => $actionId,
            'document_id' => $document->id,
            'bundle_id' => $bundleId,
            'user_id' => $user['id'],
            'office_id' => $officeId,
            'assigned_to' => $assignedTo,
            'endorsed_to' => $endorsedTo,
            'description' => $description,
            'remarks' => $remarks,
        ]);

        // One transaction for the batch, so a failure part-way can't leave some
        // documents with the other office and the rest still here.
        DB::transaction(function () use ($documents, $officeId, $destination, $endorsedTo, $forwardedId, $receivingId, $log) {
            foreach ($documents as $document) {
                $type = $document->is_bundle ? 'Bundle' : 'Document';

                // Read while still keyed to this office, before the bundle moves.
                $attachments = Document::where('assigned_to', $officeId)
                    ->where('status', 'On Process')
                    ->where('bundle_id', $document->id)
                    ->orderByDesc('created_at')
                    ->get();

                $handOver = ['assigned_to' => $destination['id'], 'endorsed_to' => $endorsedTo, 'status' => 'For Receiving'];

                $document->update($handOver);
                $log($document, null, $forwardedId, $officeId, "{$type} forwarded to {$destination['name']} for appropriate action.");
                $log($document, null, $receivingId, $destination['id'], "{$type} has been transferred and is to be received by {$destination['name']}");

                foreach ($attachments as $attachment) {
                    $attachment->update($handOver);
                    $log($attachment, $document->id, $forwardedId, $officeId, "{$type} forwarded to {$destination['name']} for appropriate action.");
                    $log($attachment, $document->id, $receivingId, $destination['id'], "Bundle ({$document->control_no}) has been transferred and is to be received by {$destination['name']}.");
                }
            }
        });

        return $documents->count();
    }
}
