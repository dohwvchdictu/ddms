<?php

namespace App\Actions\Documents;

use App\Models\Document;

/**
 * What the signed-in office may do to one document on its view page. Anyone
 * signed in may *view* any document (search links lead here); changing one is
 * left to the office holding it.
 *
 * The Livewire page this replaced offered every action to every viewer; these
 * rules add the office checks it lacked, and keep its status rules.
 */
class DocumentPermissions
{
    /** Statuses whose transmittal form can be printed (it needs a destination). */
    public const PRINTABLE_STATUSES = ['Forwarded', 'On Process', 'For Receiving'];

    public function __construct(protected Document $document, protected int|string|null $officeId)
    {
    }

    public static function for(Document $document): self
    {
        return new self($document, session('user')['office']['id'] ?? null);
    }

    /** Encoded by this office and not yet sent anywhere. */
    public function ownsDraft(): bool
    {
        return $this->officeId !== null
            && (string) $this->document->office_id === (string) $this->officeId
            && $this->document->status === 'Created';
    }

    /** Currently with this office: its own draft, or one it received and is working on. */
    public function holds(): bool
    {
        return $this->ownsDraft()
            || ($this->officeId !== null
                && (string) $this->document->assigned_to === (string) $this->officeId
                && $this->document->status === 'On Process');
    }

    /** A bundle goes only once something is in it; attachments travel with their bundle. */
    public function canForward(int $attachmentCount): bool
    {
        return $this->ownsDraft()
            && $this->document->bundle_id === null
            && (! $this->document->is_bundle || $attachmentCount > 0);
    }

    public function canDelete(): bool
    {
        return $this->ownsDraft();
    }

    public function canEditSubject(): bool
    {
        return $this->holds() && $this->document->status !== 'Closed';
    }

    public function canManageAttachments(): bool
    {
        return (bool) $this->document->is_bundle && $this->holds();
    }

    /** Sent to this office and waiting: forwarded here, or returned here. */
    public function canReceive(): bool
    {
        return $this->officeId !== null
            && $this->document->bundle_id === null
            && (string) $this->document->assigned_to === (string) $this->officeId
            && in_array($this->document->status, IncomingDocuments::STATUSES, true);
    }

    /** A waiting document can be sent back, unless this office is where it started. */
    public function canReturn(): bool
    {
        return $this->canReceive() && (string) $this->document->office_id !== (string) $this->officeId;
    }

    /**
     * The transmittal form goes with the paper copy, so only the office that
     * encoded and sent the document prints it, as on the Livewire pages.
     */
    public function canPrint(): bool
    {
        return $this->officeId !== null
            && (string) $this->document->office_id === (string) $this->officeId
            && in_array($this->document->status, self::PRINTABLE_STATUSES, true);
    }
}
