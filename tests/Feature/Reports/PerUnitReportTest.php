<?php

namespace Tests\Feature\Reports;

use App\Actions\Navigation\SidebarCounts;
use App\Models\Category;
use App\Models\Document;
use App\Services\ApiService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Mockery\MockInterface;
use Tests\TestCase;

/** Report › Per Category: documents per procedure / category. */
class PerUnitReportTest extends TestCase
{
    /** Office ids no real office uses, so the shared dev data never shows up here. */
    protected const OFFICE = 990001;

    protected bool $inTransaction = false;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow('2026-10-02 09:30:00');

        $this->mock(SidebarCounts::class, fn (MockInterface $mock) => $mock->shouldReceive('handle')->andReturn([
            'incoming' => 0, 'pending' => 0, 'endorsed' => 0, 'total' => 0,
        ]));

        $offices = [['id' => self::OFFICE, 'officeCode' => 'KMICT', 'officeName' => 'Knowledge Management and ICT Unit']];

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

    /** A document this office encoded in category `$categoryId`. Rolled back in tearDown. */
    protected function document(?int $categoryId, array $overrides = []): Document
    {
        if (! $this->inTransaction) {
            DB::beginTransaction();
            $this->inTransaction = true;
        }

        return Document::create([
            'control_no' => 'DCPU' . uniqid(),
            'source' => 'internal',
            'category_id' => $categoryId,
            'subject' => 'Memorandum on the regional assembly',
            'user_id' => 7,
            'office_id' => self::OFFICE,
            'assigned_to' => self::OFFICE,
            'is_arta' => false,
            'is_bundle' => false,
            'status' => 'Created',
            ...$overrides,
        ]);
    }

    public function test_guests_are_sent_to_the_login_page(): void
    {
        $this->get('/report-per-unit')->assertRedirect(route('login'));
    }

    public function test_documents_are_counted_per_category(): void
    {
        $purchase = Category::where('name', 'like', '%Purchase%')->firstOrFail();
        $general = Category::where('name', 'not like', '%Purchase%')->where('name', 'not like', '%Payment%')->firstOrFail();

        $this->document($purchase->id);
        $this->document($purchase->id);
        $this->document($general->id, ['source' => 'external', 'status' => 'Closed']);

        $this->signedIn()
            ->get('/report-per-unit?office=' . self::OFFICE)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('reports/per-unit')
                ->where('filters.offices', [(string) self::OFFICE])
                // Live counts for the filter buttons.
                ->where('report.facets.sources', ['internal' => 2, 'external' => 1])
                ->where('report.facets.statuses', ['Closed' => 1, 'Created' => 2])
                ->where('defaultRange', ['from' => '2026-09-03', 'to' => '2026-10-02'])
                ->where('report.total', 3)
                // Most documents first.
                ->where('report.rows.0', ['name' => $purchase->name, 'count' => 2])
                ->where('report.rows.1', ['name' => $general->name, 'count' => 1]));

        // Narrowed by source and status; several statuses at once.
        $this->signedIn()
            ->get('/report-per-unit?office=' . self::OFFICE . '&source=external&status=Closed')
            ->assertInertia(fn (Assert $page) => $page->where('report.total', 1));

        $this->signedIn()
            ->get('/report-per-unit?office=' . self::OFFICE . '&status=Closed,Created')
            ->assertInertia(fn (Assert $page) => $page->where('report.total', 3));
    }

    public function test_unknown_filter_values_are_dropped(): void
    {
        $this->signedIn()
            ->get('/report-per-unit?office=123456789&source=fax,internal&status=Lost')
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.offices', [])
                ->where('filters.sources', ['internal'])
                ->where('filters.statuses', []));
    }
}
