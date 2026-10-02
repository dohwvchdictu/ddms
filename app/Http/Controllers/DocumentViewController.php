<?php

namespace App\Http\Controllers;

use App\Actions\Dashboard\DeadlineCounts;
use App\Actions\Documents\CreateDocument;
use App\Actions\Documents\DocumentPermissions;
use App\Actions\Documents\DocumentTracking;
use App\Models\Action;
use App\Models\Document;
use App\Models\Log;
use App\Services\ApiService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

/**
 * One document's page: its details, routing history and bundle contents, with
 * the actions its office may take. Replaces the Livewire Views\DocumentDetail.
 */
class DocumentViewController extends Controller
{
    public const SUBJECT_MAX = 500;

    public function show(string $controlNo, DocumentTracking $tracking, ApiService $api): Response
    {
        $document = Document::with(['category', 'citizencharter'])->where('control_no', $controlNo)->firstOrFail();
        $officeId = session('user')['office']['id'] ?? null;

        $offices = collect($api->getOfficesData()['officeList'] ?? [])->keyBy('id');
        $employees = collect($api->getEmployeesData()['employeesList'] ?? [])->keyBy('id');
        $officeName = fn ($id) => $id ? ($offices[$id]['officeName'] ?? null) : null;
        $employeeName = function ($id) use ($employees) {
            $employee = $id ? ($employees[$id] ?? null) : null;

            return $employee ? trim(($employee['firstName'] ?? '') . ' ' . ($employee['lastName'] ?? '') . ' ' . ($employee['suffix'] ?? '')) : null;
        };

        // A bundle's contents: what is with this office can be taken out; the rest is shown for reference.
        $attachments = $document->is_bundle
            ? Document::with(['category', 'citizencharter'])->where('bundle_id', $document->id)->latest()->get()
            : collect();
        $removable = fn (Document $attachment) => $officeId !== null
            && (string) $attachment->assigned_to === (string) $officeId
            && $attachment->status === 'On Process';

        $can = DocumentPermissions::for($document);
        $trail = $tracking->handle($document->id);
        $due = DeadlineCounts::dueDate($document);

        return Inertia::render('documents/show', [
            'document' => [
                'id' => $document->id,
                'control_no' => $document->control_no,
                'subject' => $document->subject,
                'classification' => $document->classification,
                'charter' => $document->category_id ? $document->citizencharter?->name : null,
                'status' => $document->status,
                'source' => $document->source,
                'is_bundle' => (bool) $document->is_bundle,
                'bundle' => $document->bundle_id ? Document::whereKey($document->bundle_id)->value('control_no') : null,
                'created_at' => $document->created_at?->toIso8601String(),
                'origin' => $officeName($document->office_id),
                'encoded_by' => $employeeName($document->user_id),
                'endorsed_to' => $employeeName($document->endorsed_to),
                'current_location' => $trail['document']['current_location'] ?? null,
                'turnaround' => $trail['document']['turnaroundtime'] ?? null,
                'required_days' => DeadlineCounts::requiredDays($document),
                'due_date' => $due->toDateString(),
                // A closed document's deadline is history, not a countdown.
                'days_left' => $document->status === 'Closed' ? null : DeadlineCounts::remainingDays($document->created_at, DeadlineCounts::requiredDays($document)),
            ],
            'timeline' => $trail['timeline'] ?? [],
            'attachments' => $attachments->map(fn (Document $attachment) => [
                'id' => $attachment->id,
                'control_no' => $attachment->control_no,
                'subject' => $attachment->subject,
                'classification' => $attachment->classification,
                'status' => $attachment->status,
                'location' => $officeName($attachment->assigned_to ?: $attachment->office_id),
                'removable' => $can->canManageAttachments() && $removable($attachment),
            ])->values(),
            // Documents this office could put in the bundle: received, being worked on, not in a bundle.
            'attachable' => $can->canManageAttachments()
                ? self::attachable($document, $officeId)
                    ->with(['category', 'citizencharter'])
                    ->latest('updated_at')
                    ->get()
                    ->map(fn (Document $candidate) => [
                        'id' => $candidate->id,
                        'control_no' => $candidate->control_no,
                        'subject' => $candidate->subject,
                        'classification' => $candidate->classification,
                        'origin' => $officeName($candidate->office_id),
                        // Last change: for a document on process here, when it was received.
                        'received_at' => $candidate->updated_at?->toIso8601String(),
                    ])->values()
                : [],
            'can' => [
                'forward' => $can->canForward($attachments->count()),
                'delete' => $can->canDelete(),
                'edit_subject' => $can->canEditSubject(),
                'manage_attachments' => $can->canManageAttachments(),
                'print' => $can->canPrint(),
            ],
            // Destinations for Forward: active offices only.
            'offices' => collect($api->getActiveOffices())
                ->map(fn (array $office) => ['id' => $office['id'], 'name' => $office['officeName'] ?? '', 'code' => $office['officeCode'] ?? null])
                ->values(),
            'subjectMax' => self::SUBJECT_MAX,
        ]);
    }

    public function updateSubject(Request $request, Document $document): RedirectResponse
    {
        abort_unless(DocumentPermissions::for($document)->canEditSubject(), 403);

        $data = $request->validate([
            'subject' => ['required', 'string', 'min:8', 'max:' . self::SUBJECT_MAX],
        ]);

        $document->update(['subject' => trim($data['subject'])]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Subject updated']);

        return back();
    }

    public function destroy(Document $document): SymfonyResponse
    {
        abort_unless(DocumentPermissions::for($document)->canDelete(), 403);

        $list = CreateDocument::listPath($document);
        $kind = $document->is_bundle ? 'Bundle' : 'Document';

        DB::transaction(function () use ($document) {
            // Anything attached goes back to being a loose document, rather than
            // pointing at a bundle that no longer exists.
            Document::where('bundle_id', $document->id)->update(['bundle_id' => null]);
            $document->logs()->delete();
            $document->delete();
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => "{$kind} deleted", 'description' => $document->control_no]);

        return redirect($list);
    }

    public function attach(Request $request, Document $document): RedirectResponse
    {
        abort_unless(DocumentPermissions::for($document)->canManageAttachments(), 403);

        $officeId = session('user')['office']['id'];

        $data = $request->validate([
            'document_ids' => ['required', 'array', 'min:1', 'max:200'],
            'document_ids.*' => ['integer', 'distinct'],
        ], [
            'document_ids.required' => 'Pick at least one document to add.',
        ]);

        $picked = array_map('intval', $data['document_ids']);
        $allowed = self::attachable($document, $officeId)->whereKey($picked)->pluck('id')->map(fn ($id) => (int) $id)->all();
        $stale = array_diff($picked, $allowed);

        if ($stale !== []) {
            throw ValidationException::withMessages([
                'document_ids' => count($stale) === 1
                    ? 'One of the picked documents was moved or changed since this page loaded. Reload and try again.'
                    : count($stale) . ' of the picked documents were moved or changed since this page loaded. Reload and try again.',
            ]);
        }

        $data['document_ids'] = $allowed;

        $attachedId = Action::where('name', 'Attached')->value('id');

        DB::transaction(function () use ($data, $document, $officeId, $attachedId) {
            foreach ($data['document_ids'] as $id) {
                Document::whereKey($id)->update(['bundle_id' => $document->id]);

                Log::create([
                    'action_id' => $attachedId,
                    'document_id' => $id,
                    'bundle_id' => $document->id,
                    'user_id' => session('user')['id'],
                    'office_id' => $officeId,
                    'assigned_to' => $officeId,
                    'description' => "Document has been attached to Bundle of {$document->classification} ({$document->control_no}).",
                ]);
            }
        });

        $count = count($data['document_ids']);
        Inertia::flash('toast', ['type' => 'success', 'message' => ($count === 1 ? 'Document' : "{$count} documents") . ' added to the bundle']);

        return back();
    }

    public function detach(Document $document, Document $attachment): RedirectResponse
    {
        $officeId = session('user')['office']['id'] ?? null;

        abort_unless(
            DocumentPermissions::for($document)->canManageAttachments()
                && (int) $attachment->bundle_id === (int) $document->id
                && (string) $attachment->assigned_to === (string) $officeId
                && $attachment->status === 'On Process',
            403,
        );

        DB::transaction(function () use ($document, $attachment, $officeId) {
            Log::create([
                'action_id' => Action::where('name', 'Removed')->value('id'),
                'document_id' => $attachment->id,
                'bundle_id' => null,
                'user_id' => session('user')['id'],
                'office_id' => $officeId,
                'assigned_to' => $officeId,
                'description' => "Document has been removed from Bundle of {$document->classification} ({$document->control_no}).",
            ]);

            $attachment->update(['bundle_id' => null]);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Removed from the bundle', 'description' => $attachment->control_no]);

        return back();
    }

    /**
     * What may go into this bundle: documents this office received and is
     * working on, not bundles themselves, not already in a bundle. Used for
     * both the picker and the save, so the two always agree.
     */
    protected static function attachable(Document $bundle, int|string|null $officeId): Builder
    {
        return Document::query()
            ->where('assigned_to', $officeId)
            ->where('status', 'On Process')
            ->whereNull('bundle_id')
            // NULL counts as "not a bundle" too.
            ->where(fn (Builder $where) => $where->where('is_bundle', 0)->orWhereNull('is_bundle'))
            ->whereKeyNot($bundle->id);
    }
}
