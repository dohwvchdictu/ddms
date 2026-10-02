<?php

namespace App\Actions\Documents;

use App\Models\Action;
use App\Models\Document;
use App\Models\Log;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Sends a waiting document (and, for a bundle, what is in it) back to another
 * office, with the reason. Ported from Livewire Views\IncomingDetail::return().
 */
class ReturnDocument
{
    /**
     * @param  array<string, mixed>  $user  The session employee.
     * @param  array{id: int|string, name: string}  $to
     */
    public function handle(Document $document, array $user, array $to, string $fromName, string $remarks): void
    {
        $officeId = $user['office']['id'];

        $returnedId = Action::where('name', 'Returned')->value('id')
            ?? throw new RuntimeException('The "Returned" action is missing from the actions table.');

        $description = ($document->is_bundle ? 'Bundle' : 'Document') . " has been returned to {$to['name']} by {$fromName}.";

        DB::transaction(function () use ($document, $user, $officeId, $to, $remarks, $returnedId, $description) {
            $attachments = Document::where('assigned_to', $officeId)->where('bundle_id', $document->id)->get();

            foreach ([$document, ...$attachments] as $returned) {
                $returned->update(['assigned_to' => $to['id'], 'status' => 'Returned']);

                Log::create([
                    'action_id' => $returnedId,
                    'document_id' => $returned->id,
                    'bundle_id' => $returned->is($document) ? null : $document->id,
                    'user_id' => $user['id'],
                    'office_id' => $officeId,
                    'assigned_to' => $to['id'],
                    'remarks' => $remarks,
                    'description' => $description,
                ]);
            }
        });
    }
}
