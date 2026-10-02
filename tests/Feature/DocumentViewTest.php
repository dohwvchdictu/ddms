<?php

namespace Tests\Feature;

use App\Actions\Navigation\SidebarCounts;
use App\Models\Document;
use App\Models\Log;
use App\Services\ApiService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Mockery\MockInterface;
use Tests\TestCase;

class DocumentViewTest extends TestCase
{
    /** Office ids no real office uses, so the shared dev data never interferes. */
    protected const OFFICE = 990001;

    protected const OTHER_OFFICE = 990002;

    protected bool $inTransaction = false;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow('2026-10-01 09:30:00');

        $this->mock(SidebarCounts::class, fn (MockInterface $mock) => $mock->shouldReceive('handle')->andReturn([
            'incoming' => 0, 'pending' => 0, 'endorsed' => 0, 'total' => 0,
        ]));

        $offices = [
            ['id' => self::OFFICE, 'officeCode' => 'KMICT', 'officeName' => 'Knowledge Management and ICT Unit'],
            ['id' => 12, 'officeCode' => 'RLED', 'officeName' => 'Regulation, Licensing and Enforcement Division'],
        ];

        $this->mock(ApiService::class, function (MockInterface $mock) use ($offices) {
            $mock->shouldReceive('getOfficesData')->andReturn(['officeList' => $offices]);
            $mock->shouldReceive('getActiveOffices')->andReturn($offices);
            $mock->shouldReceive('getEmployeesData')->andReturn(['employeesList' => [
                ['id' => 7, 'firstName' => 'Juan', 'lastName' => 'Dela Cruz', 'suffix' => '', 'office' => ['id' => self::OFFICE]],
            ]]);
        });
    }

    protected function tearDown(): void
    {
        if ($this->inTransaction) {
            DB::rollBack();
        }

        parent::tearDown();
    }

    protected function signedIn(int $office = self::OFFICE): self
    {
        return $this->withSession([
            'jwt_token' => 'token',
            'user' => ['id' => 7, 'firstName' => 'Juan', 'lastName' => 'Dela Cruz', 'suffix' => '', 'office' => ['id' => $office]],
            'token_created_at' => time(),
            'revalidated_at' => time(),
        ]);
    }

    /** A document saved inside a transaction that tearDown rolls back. */
    protected function saveDocument(array $overrides = []): Document
    {
        if (! $this->inTransaction) {
            DB::beginTransaction();
            $this->inTransaction = true;
        }

        return Document::create([
            'control_no' => 'DCVIEW' . uniqid(),
            'source' => 'internal',
            'category_id' => null,
            'subject' => 'Memorandum on the regional assembly',
            'user_id' => 7,
            'office_id' => self::OFFICE,
            'is_arta' => false,
            'is_bundle' => false,
            'citizen_charter_id' => null,
            'status' => 'Created',
            ...$overrides,
        ]);
    }

    public function test_guests_are_sent_to_the_login_page(): void
    {
        $this->get('/document/view/DC1')->assertRedirect(route('login'));
    }

    public function test_an_unknown_control_number_is_not_found(): void
    {
        $this->signedIn()->get('/document/view/DC-NO-SUCH-DOCUMENT')->assertNotFound();
    }

    public function test_the_page_shows_the_document_and_its_actions(): void
    {
        $document = $this->saveDocument();

        $this->signedIn()
            ->get("/document/view/{$document->control_no}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('documents/show')
                ->where('document.control_no', $document->control_no)
                ->where('document.origin', 'Knowledge Management and ICT Unit')
                ->where('document.encoded_by', 'Juan Dela Cruz')
                ->where('document.required_days', Document::DEFAULT_REQUIRED_DAYS)
                ->where('can', ['forward' => true, 'delete' => true, 'edit_subject' => true, 'manage_attachments' => false, 'print' => false, 'receive' => false, 'return' => false])
                ->has('timeline')
                ->has('offices', 2));
    }

    public function test_another_office_can_view_but_not_change_it(): void
    {
        $document = $this->saveDocument();

        $this->signedIn(self::OTHER_OFFICE)
            ->get("/document/view/{$document->control_no}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('can', ['forward' => false, 'delete' => false, 'edit_subject' => false, 'manage_attachments' => false, 'print' => false, 'receive' => false, 'return' => false]));

        $this->signedIn(self::OTHER_OFFICE)->patch("/documents/{$document->id}/subject", ['subject' => 'Someone else rewrote this'])->assertForbidden();
        $this->signedIn(self::OTHER_OFFICE)->delete("/documents/{$document->id}")->assertForbidden();
    }

    public function test_the_subject_can_be_edited(): void
    {
        $document = $this->saveDocument();

        $this->signedIn()
            ->from("/document/view/{$document->control_no}")
            ->patch("/documents/{$document->id}/subject", ['subject' => '  Memorandum on the regional assembly, revised  '])
            ->assertRedirect("/document/view/{$document->control_no}");

        $this->assertSame('Memorandum on the regional assembly, revised', $document->fresh()->subject);
    }

    public function test_a_short_subject_is_rejected(): void
    {
        $document = $this->saveDocument();

        $this->signedIn()->patch("/documents/{$document->id}/subject", ['subject' => 'short'])->assertSessionHasErrors('subject');
        $this->assertSame('Memorandum on the regional assembly', $document->fresh()->subject);
    }

    public function test_a_closed_document_cannot_be_edited_or_deleted(): void
    {
        $document = $this->saveDocument(['status' => 'Closed']);

        $this->signedIn()->patch("/documents/{$document->id}/subject", ['subject' => 'Memorandum, edited after closing'])->assertForbidden();
        $this->signedIn()->delete("/documents/{$document->id}")->assertForbidden();
    }

    public function test_deleting_removes_the_document_and_frees_its_attachments(): void
    {
        $bundle = $this->saveDocument(['is_bundle' => true]);
        $attachment = $this->saveDocument(['bundle_id' => $bundle->id, 'assigned_to' => self::OFFICE, 'status' => 'On Process']);
        Log::create(['action_id' => 6, 'document_id' => $bundle->id, 'user_id' => 7, 'office_id' => self::OFFICE, 'description' => 'Created']);

        $this->signedIn()->delete("/documents/{$bundle->id}")->assertRedirect('/my-documents');

        $this->assertNull(Document::find($bundle->id));
        $this->assertSame(0, Log::where('document_id', $bundle->id)->count());
        $this->assertNull($attachment->fresh()->bundle_id);
    }

    public function test_documents_can_be_added_to_and_removed_from_a_bundle(): void
    {
        $bundle = $this->saveDocument(['is_bundle' => true]);
        $received = $this->saveDocument(['office_id' => 12, 'assigned_to' => self::OFFICE, 'status' => 'On Process']);

        $this->signedIn()
            ->get("/document/view/{$bundle->control_no}")
            ->assertInertia(fn (Assert $page) => $page
                ->where('can.manage_attachments', true)
                // An empty bundle can't be forwarded yet.
                ->where('can.forward', false)
                ->where('attachable.0.id', $received->id));

        $this->signedIn()->post("/documents/{$bundle->id}/attachments", ['document_ids' => [$received->id]])->assertRedirect();
        $this->assertSame($bundle->id, (int) $received->fresh()->bundle_id);
        $this->assertDatabaseHas('logs', ['document_id' => $received->id, 'bundle_id' => $bundle->id]);

        $this->signedIn()
            ->get("/document/view/{$bundle->control_no}")
            ->assertInertia(fn (Assert $page) => $page
                ->where('can.forward', true)
                ->where('attachments.0.removable', true));

        $this->signedIn()->delete("/documents/{$bundle->id}/attachments/{$received->id}")->assertRedirect();
        $this->assertNull($received->fresh()->bundle_id);
    }

    public function test_only_documents_with_this_office_can_be_added(): void
    {
        $bundle = $this->saveDocument(['is_bundle' => true]);
        $elsewhere = $this->saveDocument(['office_id' => 12, 'assigned_to' => 12, 'status' => 'On Process']);

        $this->signedIn()
            ->post("/documents/{$bundle->id}/attachments", ['document_ids' => [$elsewhere->id]])
            ->assertSessionHasErrors('document_ids');

        $this->assertNull($elsewhere->fresh()->bundle_id);
    }

    /** A document another office sent here, waiting to be received. */
    protected function sentHere(array $overrides = []): Document
    {
        $document = $this->saveDocument([
            'office_id' => self::OTHER_OFFICE,
            'assigned_to' => self::OFFICE,
            'status' => 'For Receiving',
            ...$overrides,
        ]);
        Log::create(['action_id' => 3, 'document_id' => $document->id, 'user_id' => 9, 'office_id' => self::OTHER_OFFICE, 'assigned_to' => self::OFFICE, 'description' => 'Forwarded']);

        return $document;
    }

    public function test_the_incoming_address_opens_the_same_page_with_receive_and_return(): void
    {
        $document = $this->sentHere();

        $this->signedIn()
            ->get("/document/incoming/{$document->control_no}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('documents/show')
                ->where('context', 'incoming')
                ->where('can.receive', true)
                ->where('can.return', true)
                ->where('can.forward', false)
                // The transmittal form is the sender's to print.
                ->where('can.print', false)
                ->where('sender', self::OTHER_OFFICE));
    }

    public function test_receiving_from_the_page_moves_it_to_pending(): void
    {
        $document = $this->sentHere(['endorsed_to' => 7]);

        $this->signedIn()
            ->from("/document/incoming/{$document->control_no}")
            ->post('/status-incoming/receive', ['document_ids' => [$document->id]])
            ->assertRedirect("/document/incoming/{$document->control_no}");

        $this->assertSame('On Process', $document->fresh()->status);
        $this->assertDatabaseHas('logs', ['document_id' => $document->id, 'office_id' => self::OFFICE, 'endorsed_to' => 7]);
    }

    public function test_returning_sends_it_back_with_the_reason(): void
    {
        $bundle = $this->sentHere(['is_bundle' => true]);
        $inside = $this->saveDocument(['office_id' => self::OTHER_OFFICE, 'assigned_to' => self::OFFICE, 'status' => 'For Receiving', 'bundle_id' => $bundle->id]);

        $this->signedIn()
            ->post("/documents/{$bundle->id}/return", ['office_id' => 12, 'remarks' => 'Missing signature on page 2'])
            ->assertRedirect(route('incoming'));

        foreach ([$bundle, $inside] as $document) {
            $fresh = $document->fresh();
            $this->assertSame('Returned', $fresh->status);
            $this->assertSame(12, (int) $fresh->assigned_to);
        }
        $this->assertDatabaseHas('logs', ['document_id' => $bundle->id, 'remarks' => 'Missing signature on page 2', 'assigned_to' => 12]);
    }

    public function test_a_return_needs_an_office_and_a_reason(): void
    {
        $document = $this->sentHere();

        $this->signedIn()
            ->post("/documents/{$document->id}/return", ['office_id' => self::OFFICE, 'remarks' => ''])
            ->assertSessionHasErrors(['office_id', 'remarks']);

        $this->assertSame('For Receiving', $document->fresh()->status);
    }

    public function test_a_document_this_office_created_cannot_be_returned(): void
    {
        $own = $this->saveDocument(['assigned_to' => self::OFFICE, 'status' => 'Returned']);

        $this->signedIn()
            ->get("/document/incoming/{$own->control_no}")
            ->assertInertia(fn (Assert $page) => $page->where('can.receive', true)->where('can.return', false));

        $this->signedIn()->post("/documents/{$own->id}/return", ['office_id' => 12, 'remarks' => 'No'])->assertForbidden();
    }
}
