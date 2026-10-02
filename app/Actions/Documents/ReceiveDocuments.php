<?php

namespace App\Actions\Documents;

use App\Models\Action;
use App\Models\Document;
use App\Models\Log;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * An office receives documents sent to it: each (and, for a bundle, everything
 * in it) moves to On Process with a "Received" log. Ported from Livewire
 * Status\Incoming::receive().
 */
class ReceiveDocuments
{
    public function __construct(protected IncomingDocuments $incoming)
    {
    }

    /**
     * @param  list<int>  $documentIds  Anything this office can't receive is skipped.
     * @param  array<string, mixed>  $user  The session employee.
     * @return int How many were received (bundles count once).
     */
    public function handle(array $documentIds, array $user, string $officeName): int
    {
        $officeId = $user['office']['id'];

        // Re-checked here: still sent to this office, still waiting, not an attachment.
        $documents = $this->incoming->receivable($officeId)->whereIn('documents.id', $documentIds)->get();

        if ($documents->isEmpty()) {
            return 0;
        }

        $receivedId = Action::where('name', 'Received')->value('id')
            ?? throw new RuntimeException('The "Received" action is missing from the actions table.');

        // One transaction for the batch, so a failure part-way leaves nothing half-received.
        DB::transaction(function () use ($documents, $officeId, $officeName, $receivedId, $user) {
            foreach ($documents as $document) {
                $description = ($document->is_bundle ? 'Bundle' : 'Document') . " ({$document->control_no}) has been received and being process by {$officeName}.";
                $log = fn (Document $received, ?int $bundleId) => Log::create([
                    'action_id' => $receivedId,
                    'document_id' => $received->id,
                    'bundle_id' => $bundleId,
                    'user_id' => $user['id'],
                    'office_id' => $officeId,
                    'assigned_to' => $officeId,
                    // Keeps the endorsement on record, as the single-document receive did.
                    'endorsed_to' => $document->endorsed_to,
                    'description' => $description,
                ]);

                $document->update(['assigned_to' => $officeId, 'status' => 'On Process']);
                $log($document, null);

                // Returning a bundle marks its contents Returned too, so both statuses count.
                $attachments = Document::where('assigned_to', $officeId)
                    ->whereIn('status', IncomingDocuments::STATUSES)
                    ->where('bundle_id', $document->id)
                    ->get();

                foreach ($attachments as $attachment) {
                    $attachment->update(['assigned_to' => $officeId, 'status' => 'On Process']);
                    $log($attachment, $document->id);
                }
            }
        });

        return $documents->count();
    }
}
