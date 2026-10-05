<?php

namespace Tests\Feature\Reports;

use App\Actions\Navigation\SidebarCounts;
use App\Models\Action;
use App\Models\Document;
use App\Models\Log;
use App\Services\ApiService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Mockery\MockInterface;
use Tests\TestCase;

/** Report › External Requests: the office's external requests and their deadlines, on screen and printed. */
class ExternalRequestsReportTest extends TestCase
{
    /** Office ids no real office uses, so the shared dev data never shows up here. */
    protected const OFFICE = 990001;

    protected const OTHER = 990002;

    protected bool $inTransaction = false;

    protected function setUp(): void
    {
        parent::setUp();

        // A Friday, so working-day counts are easy to follow.
        Carbon::setTestNow('2026-10-02 09:30:00');

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

    protected function signedIn(): self
    {
        return $this->withSession([
            'jwt_token' => 'token',
            'user' => ['id' => 7, 'firstName' => 'Juan', 'lastName' => 'Dela Cruz', 'suffix' => '', 'office' => ['id' => self::OFFICE, 'officeName' => 'Knowledge Management and ICT Unit']],
            'token_created_at' => time(),
            'revalidated_at' => time(),
        ]);
    }

    /** An external request this office encoded at `$createdAt` (3 working days allowed by default). */
    protected function request(string $createdAt, string $status = 'On Process', array $overrides = []): Document
    {
        if (! $this->inTransaction) {
            DB::beginTransaction();
            $this->inTransaction = true;
        }

        $document = Document::create([
            'control_no' => 'DCEX' . uniqid(),
            'source' => 'external',
            'category_id' => null,
            'subject' => 'Request for certified copies',
            'user_id' => 7,
            'office_id' => self::OFFICE,
            'assigned_to' => self::OTHER,
            'is_arta' => false,
            'is_bundle' => false,
            'status' => $status,
            ...$overrides,
        ]);

        DB::table('documents')->where('id', $document->id)->update(['created_at' => $createdAt]);

        return $document;
    }

    public function test_guests_are_sent_to_the_login_page(): void
    {
        $this->get('/report-status-of-external-documents')->assertRedirect(route('login'));
    }

    public function test_requests_get_their_route_and_deadline(): void
    {
        $overdue = $this->request('2026-09-24 08:00:00');                // due Sep 29: 3 days overdue
        $due = $this->request('2026-10-01 08:00:00');                    // due Oct 6: due in 2 days
        $done = $this->request('2026-09-30 08:00:00', 'Closed');
        $this->request('2026-10-01 08:00:00', 'On Process', ['source' => 'internal']);    // not external
        $this->request('2026-10-01 08:00:00', 'On Process', ['office_id' => self::OTHER]); // another office's

        Log::create([
            'action_id' => Action::where('name', 'For Receiving')->value('id'),
            'document_id' => $overdue->id,
            'user_id' => 7,
            'office_id' => self::OFFICE,
            'assigned_to' => self::OTHER,
            'description' => 'For Receiving',
            'remarks' => 'Please act on this.',
        ]);

        $this->signedIn()
            ->get('/report-status-of-external-documents')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('reports/external-requests')
                ->where('counts', ['all' => 3, 'overdue' => 1, 'due' => 1, 'pending' => 0, 'complete' => 1])
                // Newest first.
                ->where('requests.data.0.control_no', $due->control_no)
                ->where('requests.data.0.deadline_label', 'Due in 2 days')
                ->where('requests.data.1.control_no', $done->control_no)
                ->where('requests.data.1.state', 'complete')
                ->where('requests.data.2.control_no', $overdue->control_no)
                ->where('requests.data.2.deadline_label', '3 days overdue')
                ->where('requests.data.2.first_destination.code', 'RLED')
                ->where('requests.data.2.encoded_by', 'Juan Dela Cruz')
                ->where('requests.data.2.remarks', 'Please act on this.'));
    }

    public function test_tabs_and_the_urgent_first_order(): void
    {
        $this->request('2026-10-01 08:00:00');
        $overdue = $this->request('2026-09-24 08:00:00');

        $this->signedIn()
            ->get('/report-status-of-external-documents?state=overdue')
            ->assertInertia(fn (Assert $page) => $page
                ->where('requests.total', 1)
                ->where('counts.all', 2));

        $this->signedIn()
            ->get('/report-status-of-external-documents?sort=remaining')
            ->assertInertia(fn (Assert $page) => $page->where('requests.data.0.control_no', $overdue->control_no));
    }

    public function test_the_print_lists_what_the_screen_shows(): void
    {
        $shown = $this->request('2026-10-01 08:00:00');
        $older = $this->request('2026-08-01 08:00:00');   // outside the last 30 days

        $this->signedIn()
            ->get('/print-external-documents-report')
            ->assertOk()
            ->assertViewIs('reports.external-requests-print')
            ->assertSee($shown->control_no)
            ->assertDontSee($older->control_no)
            ->assertSee('Knowledge Management and ICT Unit');
    }
}
