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

/** The printed Document Tracking Form: the data on it, not its layout. */
class TransmittalFormTest extends TestCase
{
    /** Office ids no real office uses, so the shared dev data never shows up here. */
    protected const OFFICE = 990001;

    protected const FIRST_STOP = 990002;

    protected const SECOND_STOP = 990007;

    protected bool $inTransaction = false;

    protected function setUp(): void
    {
        parent::setUp();

        $this->mock(SidebarCounts::class, fn (MockInterface $mock) => $mock->shouldReceive('handle')->andReturn([
            'incoming' => 0, 'pending' => 0, 'endorsed' => 0, 'total' => 0,
        ]));

        // Ids neither sequential nor starting at 1: the old lookup assumed both.
        $offices = [
            ['id' => self::SECOND_STOP, 'officeCode' => 'HRMU', 'officeName' => 'Human Resource Management Unit'],
            ['id' => self::OFFICE, 'officeCode' => 'KMICT', 'officeName' => 'Knowledge Management and ICT Unit'],
            ['id' => self::FIRST_STOP, 'officeCode' => 'RLED', 'officeName' => 'Regulation, Licensing and Enforcement Division'],
        ];

        $this->mock(ApiService::class, function (MockInterface $mock) use ($offices) {
            $mock->shouldReceive('getOfficesData')->andReturn(['officeList' => $offices]);
            $mock->shouldReceive('getActiveOffices')->andReturn($offices);
            $mock->shouldReceive('getEmployeesData')->andReturn(['employeesList' => [
                ['id' => 7, 'firstName' => 'Juan', 'lastName' => 'Dela Cruz', 'suffix' => '', 'office' => ['id' => self::OFFICE]],
                ['id' => 9, 'firstName' => 'Maria', 'lastName' => 'Santos', 'suffix' => '', 'office' => ['id' => self::OFFICE]],
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

    /** Signed in as Juan of OFFICE. */
    protected function signedIn(int $office = self::OFFICE): self
    {
        return $this->withSession([
            'jwt_token' => 'token',
            'user' => ['id' => 7, 'firstName' => 'Juan', 'lastName' => 'Dela Cruz', 'suffix' => '', 'office' => ['id' => $office, 'officeName' => 'Knowledge Management and ICT Unit']],
            'token_created_at' => time(),
            'revalidated_at' => time(),
        ]);
    }

    /** A document Maria (9) of OFFICE encoded, forwarded to each office in turn. Rolled back in tearDown. */
    protected function forwarded(array $stops = [self::FIRST_STOP], string $status = 'For Receiving'): Document
    {
        if (! $this->inTransaction) {
            DB::beginTransaction();
            $this->inTransaction = true;
        }

        $document = Document::create([
            'control_no' => 'DCTF' . uniqid(),
            'source' => 'internal',
            'category_id' => null,
            'subject' => 'Memorandum on the regional assembly',
            'user_id' => 9,
            'office_id' => self::OFFICE,
            'assigned_to' => end($stops),
            'is_arta' => false,
            'is_bundle' => false,
            'status' => $status,
        ]);

        foreach ($stops as $stop) {
            Log::create([
                'action_id' => Action::where('name', 'For Receiving')->value('id'),
                'document_id' => $document->id,
                'user_id' => 9,
                'office_id' => self::OFFICE,
                'assigned_to' => $stop,
                'description' => 'For Receiving',
            ]);
        }

        return $document;
    }

    public function test_the_form_carries_the_document_its_destination_and_its_encoder(): void
    {
        $document = $this->forwarded();

        $this->signedIn()
            ->get("/print-transmittal-form/{$document->control_no}")
            ->assertOk()
            ->assertViewIs('print.transmittal-form')
            ->assertSee($document->control_no)
            ->assertSee('Knowledge Management and ICT Unit')
            ->assertSee('Regulation, Licensing and Enforcement Division')
            // The encoder, not Juan who is printing it.
            ->assertSee('Santos, Maria')
            ->assertDontSee('Dela Cruz, Juan');
    }

    public function test_it_prints_itself_on_load_without_needing_the_internet(): void
    {
        $document = $this->forwarded();

        $this->signedIn()
            ->get("/print-transmittal-form/{$document->control_no}")
            ->assertSee('<title>DDMS - Document Tracking Form</title>', false)
            ->assertSee('onload="window.print()"', false)
            ->assertSee('vendor/bootstrap-5.3.3/bootstrap.min.css')
            ->assertDontSee('cdn.jsdelivr.net');

        $this->assertFileExists(public_path('vendor/bootstrap-5.3.3/bootstrap.min.css'));
    }

    public function test_a_document_forwarded_again_prints_its_latest_destination(): void
    {
        $document = $this->forwarded([self::FIRST_STOP, self::SECOND_STOP]);

        $this->signedIn()
            ->get("/print-transmittal-form/{$document->control_no}")
            ->assertOk()
            ->assertViewHas('destination', 'Human Resource Management Unit');
    }

    public function test_only_the_origin_office_prints_and_only_once_it_has_gone_out(): void
    {
        $document = $this->forwarded();
        $draft = $this->forwarded(status: 'Created');

        $this->signedIn(self::FIRST_STOP)->get("/print-transmittal-form/{$document->control_no}")->assertForbidden();
        $this->signedIn()->get("/print-transmittal-form/{$draft->control_no}")->assertForbidden();
        $this->signedIn()->get('/print-transmittal-form/DC-NO-SUCH-DOCUMENT')->assertNotFound();
    }
}
