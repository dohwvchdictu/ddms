<?php

namespace Tests\Feature;

use App\Actions\Navigation\SidebarCounts;
use App\Models\Action;
use App\Models\Document;
use App\Models\Log;
use App\Services\ApiService;
use Illuminate\Support\Facades\DB;
use Mockery\MockInterface;
use Tests\TestCase;

/** The QR code on a transmittal form, and the printed electronic logbook. */
class QrReceiveAndLogbookTest extends TestCase
{
    /** Office ids no real office uses, so the shared dev data never shows up here. */
    protected const OFFICE = 990001;

    protected const OTHER = 990002;

    protected bool $inTransaction = false;

    protected function setUp(): void
    {
        parent::setUp();

        $this->mock(SidebarCounts::class, fn (MockInterface $mock) => $mock->shouldReceive('handle')->andReturn([
            'incoming' => 0, 'pending' => 0, 'endorsed' => 0, 'total' => 0,
        ]));

        $offices = [
            ['id' => self::OFFICE, 'officeCode' => 'KMICT', 'officeName' => 'Knowledge Management and ICT Unit'],
            ['id' => self::OTHER, 'officeCode' => 'RLED', 'officeName' => 'Regulation, Licensing and Enforcement Division'],
        ];

        $this->mock(ApiService::class, function (MockInterface $mock) use ($offices) {
            $mock->shouldReceive('getOfficesData')->andReturn(['officeList' => $offices]);
            $mock->shouldReceive('getActiveOffices')->andReturn($offices);
            $mock->shouldReceive('getEmployeesData')->andReturn(['employeesList' => []]);
        });
    }

    protected function tearDown(): void
    {
        if ($this->inTransaction) {
            DB::rollBack();
        }

        parent::tearDown();
    }

    protected function signedIn(): self
    {
        return $this->withSession([
            'jwt_token' => 'token',
            'user' => ['id' => 7, 'firstName' => 'Juan', 'lastName' => 'Dela Cruz', 'suffix' => '', 'office' => ['id' => self::OFFICE, 'officeName' => 'Knowledge Management and ICT Unit']],
            'token_created_at' => time(),
            'revalidated_at' => time(),
        ]);
    }

    /** A document `$from` forwarded to `$to`. Rolled back in tearDown. */
    protected function forwarded(int $from, int $to, string $status = 'For Receiving'): Document
    {
        if (! $this->inTransaction) {
            DB::beginTransaction();
            $this->inTransaction = true;
        }

        $document = Document::create([
            'control_no' => 'DCQR' . uniqid(),
            'source' => 'internal',
            'category_id' => null,
            'subject' => 'Memorandum on the regional assembly',
            'user_id' => 7,
            'office_id' => $from,
            'assigned_to' => $to,
            'is_arta' => false,
            'is_bundle' => false,
            'status' => $status,
        ]);

        Log::create([
            'action_id' => Action::where('name', 'Forwarded')->value('id'),
            'document_id' => $document->id,
            'user_id' => 7,
            'office_id' => $from,
            'assigned_to' => $from,
            'description' => 'Forwarded',
        ]);

        return $document;
    }

    public function test_a_document_waiting_here_opens_on_the_incoming_page(): void
    {
        $document = $this->forwarded(self::OTHER, self::OFFICE);

        $this->signedIn()
            ->get("/document/qr-receive/{$document->control_no}")
            ->assertRedirect("/document/incoming/{$document->control_no}");
    }

    public function test_anything_else_opens_the_plain_document_view(): void
    {
        $elsewhere = $this->forwarded(self::OFFICE, self::OTHER);
        $received = $this->forwarded(self::OTHER, self::OFFICE, 'On Process');

        foreach ([$elsewhere, $received] as $document) {
            $this->signedIn()
                ->get("/document/qr-receive/{$document->control_no}")
                ->assertRedirect("/document/view/{$document->control_no}");
        }

        $this->signedIn()->get('/document/qr-receive/DC-NO-SUCH-DOCUMENT')->assertNotFound();
    }

    public function test_the_logbook_only_prints_documents_this_office_forwarded(): void
    {
        $ours = $this->forwarded(self::OFFICE, self::OTHER);
        $theirs = $this->forwarded(self::OTHER, self::OFFICE);

        $this->signedIn()
            ->get('/inbox/generate-logbook?selected_items=' . $ours->id . ',' . $theirs->id)
            ->assertOk()
            ->assertSee($ours->control_no)
            ->assertDontSee($theirs->control_no);
    }
}
