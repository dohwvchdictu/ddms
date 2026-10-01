<?php

namespace App\Http\Controllers;

use App\Actions\Dashboard\DeadlineCounts;
use App\Actions\Documents\CreateDocument;
use App\Actions\Documents\RecentCategories;
use App\Http\Requests\Documents\StoreDocumentRequest;
use App\Models\Category;
use App\Models\CitizenCharter;
use App\Models\Document;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    public function create(RecentCategories $recentCategories): Response
    {
        $user = session('user');

        return Inertia::render('documents/create', [
            // Issued with the form so the encoder sees it before saving (e.g. to
            // write on the paper copy), and kept until a save uses it up;
            // StoreDocumentRequest checks it on save.
            'controlNo' => CreateDocument::pendingControlNumber($user),
            // The server's date, so the deadline preview doesn't depend on the PC clock.
            'today' => now()->toDateString(),
            'defaultRequiredDays' => Document::DEFAULT_REQUIRED_DAYS,
            'categories' => Category::orderBy('name')->get(['id', 'name', 'required_days']),
            'charters' => CitizenCharter::where('is_active', true)->orderBy('name')->get(['id', 'name', 'required_days']),
            'recentCategoryIds' => $recentCategories->handle($user['id']),
        ]);
    }

    public function store(StoreDocumentRequest $request, CreateDocument $createDocument): RedirectResponse
    {
        $document = $createDocument->handle($request->validated(), session('user'));

        // Used up: the next form gets a new number.
        CreateDocument::forgetPending();

        // "Save & new": straight back to a fresh form, with a toast to confirm.
        if ($request->input('after') === 'new') {
            Inertia::flash('toast', [
                'type' => 'success',
                'message' => ($document->is_bundle ? 'Bundle' : 'Document') . ' saved',
                'description' => $document->control_no,
            ]);

            return redirect()->route('documents.create');
        }

        return redirect()->route('documents.created', $document);
    }

    /** The confirmation page shown after a save, with what to do next. */
    public function created(Document $document): Response
    {
        // Only the employee who encoded it; a guessed id shows nothing.
        abort_unless((string) $document->user_id === (string) session('user')['id'], 404);

        $document->load(['category', 'citizencharter']);

        return Inertia::render('documents/created', [
            'document' => [
                'id' => $document->id,
                'control_no' => $document->control_no,
                'subject' => $document->subject,
                'classification' => $document->classification,
                'source' => $document->source,
                'is_arta' => (bool) $document->is_arta,
                'is_bundle' => (bool) $document->is_bundle,
                'created_at' => $document->created_at?->toIso8601String(),
                'required_days' => DeadlineCounts::requiredDays($document),
                'due_date' => DeadlineCounts::dueDate($document)->toDateString(),
            ],
            // Still a Livewire page, so the link is a full page load.
            'listPath' => CreateDocument::listPath($document),
        ]);
    }
}
