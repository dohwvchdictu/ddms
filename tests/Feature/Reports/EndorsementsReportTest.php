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
use Tests\Concerns\LoadsDeferredProps;
use Tests\TestCase;

/** Report › Endorsements: per employee of the office, incoming / pending / processed. */
class EndorsementsReportTest extends TestCase
{
    use LoadsDeferredProps;

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

        $this->mock(ApiService::class, function (MockInterface $mock) {
            $mock->shouldReceive('getOfficesData')->andReturn(['officeList' => []]);
            $mock->shouldReceive('getActiveOffices')->andReturn([]);
            $mock->shouldReceive('getEmployeesData')->andReturn(['employeesList' => [
                ['id' => 7, 'firstName' => 'Juan', 'lastName' => 'Dela Cruz', 'suffix' => '', 'office' => ['id' => self::OFFICE]],
                ['id' => 8, 'firstName' => 'Ana', 'lastName' => 'Abad', 'suffix' => '', 'office' => ['id' => self::OFFICE]],
                ['id' => 9, 'firstName' => 'Pedro', 'lastName' => 'Elsewhere', 'suffix' => '', 'office' => ['id' => self::OTHER]],
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

    /** A document created today, endorsed to `$employee`. Rolled back in tearDown. */
    protected function endorsed(int $employee, string $status, array $overrides = []): Document
    {
        if (! $this->inTransaction) {
            DB::beginTransaction();
            $this->inTransaction = true;
        }

        return Document::create([
            'control_no' => 'DCER' . uniqid(),
            'source' => 'internal',
            'category_id' => null,
            'subject' => 'Memorandum on the regional assembly',
            'user_id' => 7,
            'office_id' => self::OTHER,
            'assigned_to' => self::OFFICE,
            'endorsed_to' => $employee,
            'is_arta' => false,
            'is_bundle' => false,
            'status' => $status,
            ...$overrides,
        ]);
    }

    public function test_guests_are_sent_to_the_login_page(): void
    {
        $this->get('/report-status-per-employee')->assertRedirect(route('login'));
    }

    public function test_each_employee_of_the_office_gets_their_figures(): void
    {
        $this->endorsed(7, 'For Receiving');
        $this->endorsed(7, 'On Process');
        $this->endorsed(7, 'On Process', ['assigned_to' => self::OTHER]);   // held elsewhere: not counted

        // Juan forwarded one on: processed.
        $done = $this->endorsed(7, 'For Receiving', ['assigned_to' => self::OTHER]);
        Log::create([
            'action_id' => Action::where('name', 'Forwarded')->value('id'),
            'document_id' => $done->id,
            'user_id' => 7,
            'office_id' => self::OFFICE,
            'assigned_to' => self::OFFICE,
            'description' => 'Forwarded',
        ]);

        $this->signedIn()
            ->getWithDeferred('/report-status-per-employee')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('reports/endorsements')
                ->where('defaultRange', ['from' => '2026-09-03', 'to' => '2026-10-02'])
                // Only this office's people, last name first, sorted.
                ->has('report.employees', 2)
                ->where('report.employees.0.name', 'Abad, Ana')
                ->where('report.employees.0.rate', null)
                ->where('report.employees.1.name', 'Dela Cruz, Juan')
                ->where('report.employees.1.incoming', 1)
                ->where('report.employees.1.pending', 1)
                ->where('report.employees.1.processed', 1)
                ->where('report.totals.processed', 1));
    }

    public function test_the_period_includes_exactly_the_days_picked(): void
    {
        $inside = $this->endorsed(7, 'On Process');
        $before = $this->endorsed(7, 'On Process');
        DB::table('documents')->where('id', $inside->id)->update(['created_at' => '2026-09-01 08:00:00']);
        DB::table('documents')->where('id', $before->id)->update(['created_at' => '2026-08-31 23:00:00']);

        $this->signedIn()
            ->getWithDeferred('/report-status-per-employee?from=2026-09-01&to=2026-09-30')
            ->assertInertia(fn (Assert $page) => $page->where('report.employees.1.pending', 1));
    }
}
