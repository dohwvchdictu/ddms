<?php

namespace App\Actions\Documents;

use App\Models\Action;
use App\Models\Category;
use App\Models\Document;
use App\Models\Log;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Encodes a new document (or bundle) for the signed-in employee's office and
 * logs its "Created" entry, the first row of its routing trail.
 */
class CreateDocument
{
    /**
     * @param  array{control_no: string, source: string, category_id: int|string|null, subject: string, is_arta: bool, is_bundle: bool, citizen_charter_id: int|string|null}  $data
     * @param  array<string, mixed>  $user  The session employee.
     */
    public function handle(array $data, array $user): Document
    {
        $officeId = $user['office']['id'];

        // A charter transaction is classified by its charter procedure, and a
        // regular one by its category; never both.
        $isArta = (bool) $data['is_arta'];
        $categoryId = $isArta ? null : $data['category_id'];
        $charterId = $isArta ? $data['citizen_charter_id'] : null;
        $isBundle = (bool) $data['is_bundle'];

        return DB::transaction(function () use ($data, $user, $officeId, $isArta, $categoryId, $charterId, $isBundle) {
            $document = Document::create([
                'control_no' => $data['control_no'],
                'source' => $data['source'],
                'category_id' => $categoryId,
                'subject' => $data['subject'],
                'user_id' => $user['id'],
                'office_id' => $officeId,
                'is_arta' => $isArta,
                'is_bundle' => $isBundle,
                'citizen_charter_id' => $charterId,
                'status' => 'Created',
            ]);

            Log::create([
                'action_id' => Action::where('name', 'Created')->value('id'),
                'document_id' => $document->id,
                'user_id' => $user['id'],
                'office_id' => $officeId,
                'assigned_to' => null,
                'description' => ($isBundle ? 'Bundle' : 'Document') . ' is created. Preparing to print tracking form.',
            ]);

            return $document;
        });
    }

    /**
     * "DC" + office + employee + timestamp, issued when the form opens. The
     * 12-hour `h` is the format every existing control number was issued with.
     */
    public static function controlNumber(int|string $officeId, int|string $userId): string
    {
        return 'DC' . $officeId . $userId . Carbon::now()->format('Ymdhis');
    }

    /** Session key of the number the open form was issued. */
    public const PENDING_KEY = 'new_document.control_no';

    /**
     * The number for the New Document form: the one already issued, until a
     * save uses it up (forgetPending). Without this, the redirect back after a
     * failed validation would issue a new number, and the form - keyed by it -
     * would reset and lose both the errors and what was typed.
     *
     * @param  array<string, mixed>  $user  The session employee.
     */
    public static function pendingControlNumber(array $user): string
    {
        $prefix = 'DC' . $user['office']['id'] . $user['id'];
        $pending = session(self::PENDING_KEY);

        // Reissued for a different employee/office in the same session, or a
        // number from another day, which would misdate the document.
        if (! is_string($pending)
            || ! str_starts_with($pending, $prefix)
            || substr($pending, strlen($prefix), 8) !== Carbon::now()->format('Ymd')) {
            $pending = self::controlNumber($user['office']['id'], $user['id']);
            session()->put(self::PENDING_KEY, $pending);
        }

        return $pending;
    }

    public static function forgetPending(): void
    {
        session()->forget(self::PENDING_KEY);
    }

    /**
     * Which "My Documents" list a new document belongs on: purchase requests
     * and payments have their own; everything else, charter transactions
     * included, goes on the general list.
     */
    public static function listPath(Document $document): string
    {
        $name = $document->category_id
            ? (string) Category::whereKey($document->category_id)->value('name')
            : '';

        return match (true) {
            str_contains($name, 'Purchase') => '/my-purchase-requests',
            str_contains($name, 'Payment') => '/my-payments',
            default => '/my-documents',
        };
    }
}
