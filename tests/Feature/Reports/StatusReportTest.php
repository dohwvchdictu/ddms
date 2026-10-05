<?php

namespace Tests\Feature\Reports;

use App\Actions\Navigation\SidebarCounts;
use App\Models\Document;
use App\Models\Log;
use App\Services\ApiService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Mockery\MockInterface;
use Tests\TestCase;

/** Report › Status of Documents: per office, received / completed / pending / overdue for a period. */
class StatusReportTest extends TestCase
{
    /** Office ids no real office uses, so the shared dev data never shows up here. */
    protected const OFFICE = 990001;

    protected const OTHER = 990002;

    protected bool $inTransaction = false;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow('2026-10-02 09:30:00');

        $this->mock(SidebarCounts::class, fn (MockInterface $mock) => $mock->shouldReceive('handle')->andReturn([
            'incoming' => 0, 'pending' => 0, 'endorsed' => 0, 'total' => 0,
        ]));

        $offices = [
            ['id' => self::OTHER, 'officeCode' => 'RLED', 'officeName' => 'Regulation, Licensing and Enforcement Division', 'status' => true],
            ['id' => self::OFFICE, 'officeCode' => 'KMICT', 'officeName' => 'Knowledge Management and ICT Unit', 'status' => true],
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

    /** A document held by `$office`, created at `$createdAt`. Rolled back in tearDown. */
    protected function document(string $createdAt, string $status = 'On Process', int $office = self::OFFICE): Document
    {
        if (! $this->inTransaction) {
            DB::beginTransaction();
            $this->inTransaction = true;
        }

        $document = Document::create([
            'control_no' => 'DCSR' . uniqid(),
            'source' => 'internal',
            'category_id' => null,
            'subject' => 'Memorandum on the regional assembly',
            'user_id' => 7,
            'office_id' => self::OTHER,
            'assigned_to' => $office,
            'is_arta' => false,
            'is_bundle' => false,
            'status' => $status,
        ]);

        DB::table('documents')->where('id', $document->id)->update(['created_at' => $createdAt]);

        return $document;
    }

    /** `$office` logs action `$actionId` (1 Received, 3 Forwarded, 5 Closed) on the document. */
    protected function log(Document $document, int $actionId, string $at, int $office = self::OFFICE): void
    {
        Log::create([
            'action_id' => $actionId,
            'document_id' => $document->id,
            'user_id' => 7,
            'office_id' => $office,
            'assigned_to' => $office,
            'description' => 'Test step',
        ])->forceFill(['created_at' => $at])->save();
    }

    public function test_guests_are_sent_to_the_login_page(): void
    {
        $this->get('/report-status-of-documents')->assertRedirect(route('login'));
    }

    public function test_it_opens_on_this_month_with_the_figures_per_office(): void
    {
        // Received and forwarded on: completed.
        $done = $this->document('2026-10-01 08:00:00', 'For Receiving', self::OTHER);
        $this->log($done, 1, '2026-10-01 09:00:00');
        $this->log($done, 3, '2026-10-01 10:00:00');

        // Received, still on process here: pending, not completed.
        $open = $this->document('2026-10-01 08:00:00');
        $this->log($open, 1, '2026-10-01 09:00:00');

        $this->signedIn()
            ->get('/report-status-of-documents')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('reports/status')
                ->where('filters', ['from' => '2026-10-01', 'to' => '2026-10-02'])
                ->where('defaultRange', ['from' => '2026-10-01', 'to' => '2026-10-02'])
                ->where('printUrl', route('print.document.status', ['startDate' => '2026-10-01', 'endDate' => '2026-10-02']))
                // Sorted by name: KMICT before RLED.
                ->where('report.offices.0.code', 'KMICT')
                ->where('report.offices.0.received', 2)
                ->where('report.offices.0.completed', 1)
                ->where('report.offices.0.pending', 1)
                ->where('report.offices.0.rate', 50)
                ->where('report.offices.1.code', 'RLED')
                ->where('report.offices.1.rate', null));
    }

    public function test_pending_documents_past_their_deadline_are_overdue(): void
    {
        // Created 2 weeks ago with the 3-working-day default: overdue.
        $this->document('2026-09-17 08:00:00');
        // Created today: not yet due.
        $this->document('2026-10-02 08:00:00');

        $this->signedIn()
            ->get('/report-status-of-documents?from=2026-09-01&to=2026-10-02')
            ->assertInertia(fn (Assert $page) => $page
                ->where('report.offices.0.pending', 2)
                ->where('report.offices.0.overdue', 1));
    }

    public function test_the_print_shows_the_same_figures(): void
    {
        $open = $this->document('2026-10-01 08:00:00');
        $this->log($open, 1, '2026-10-01 09:00:00');

        $this->signedIn()
            ->get('/print-document-status-report?startDate=2026-10-01&endDate=2026-10-02')
            ->assertOk()
            ->assertViewIs('reports.document-status-print')
            ->assertSee('Knowledge Management and ICT Unit')
            ->assertViewHas('reportData', fn (array $data) => $data['offices'][0]['received'] === 1 && $data['offices'][0]['pending'] === 1);
    }
}
