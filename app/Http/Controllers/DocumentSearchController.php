<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * The header's document search: subject or control number, newest first.
 * Same query as the Livewire DocumentSearch modal.
 */
class DocumentSearchController extends Controller
{
    /** Shorter queries match too much to be useful. */
    public const MIN_LENGTH = 2;

    public const LIMIT = 50;

    public function __invoke(Request $request): JsonResponse
    {
        $query = trim((string) $request->query('q', ''));

        if (mb_strlen($query) < self::MIN_LENGTH) {
            return response()->json(['data' => []]);
        }

        $documents = Document::with(['category', 'citizencharter'])
            ->where(function ($where) use ($query) {
                $where->where('subject', 'like', '%' . $query . '%')
                    ->orWhere('control_no', 'like', '%' . $query . '%');
            })
            ->orderByDesc('created_at')
            ->limit(self::LIMIT)
            ->get();

        return response()->json([
            'data' => $documents->map(fn (Document $document) => [
                'id' => $document->id,
                'control_no' => $document->control_no,
                'subject' => $document->subject,
                'classification' => $document->classification,
                'status' => $document->status,
                'created_at' => $document->created_at?->toIso8601String(),
            ]),
        ]);
    }
}
