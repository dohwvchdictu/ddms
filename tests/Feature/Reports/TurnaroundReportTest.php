<?php

namespace Tests\Feature\Reports;

use App\Actions\Navigation\SidebarCounts;
use App\Models\Category;
use App\Models\Document;
use App\Models\Log;
use App\Services\ApiService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Mockery\MockInterface;
use Tests\TestCase;

/** Report › Turnaround Time: working days each office keeps a document (received → forwarded / closed). */
class TurnaroundReportTest extends TestCase
{
    /** Office ids no real office uses, so the shared dev data never shows up here. */
    protected const ORIGIN = 990001;

    protected const FIRST = 990002;

    protected const SECOND = 990003;

    protected bool $inTransaction = false;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow('2026-10-02 09:30:00');

        $this->mock(SidebarCounts::class, fn (MockInterface $mock) => $mock->shouldReceive('handle')->andReturn([
            'incoming' => 0, 'pending' => 0, 'endorsed' => 0, 'total' => 0,
        ]));

        $offices = [
            ['id' => self::ORIGIN, 'officeCode' => 'KMICT', 'officeName' => 'Knowledge Management and ICT Unit'],
            ['id' => self::FIRST, 'officeCode' => 'RLED', 'officeName' => 'Regulation, Licensing and Enforcement Division'],
            ['id' => self::SECOND, 'officeCode' => 'ORD', 'officeName' => 'Office of the Regional Director'],
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
            'user' => ['id' => 7, 'firstName' => 'Juan', 'lastName' => 'Dela Cruz', 'suffix' => '', 'office' => ['id' => self::ORIGIN, 'officeName' => 'Knowledge Management and ICT Unit']],
            'token_created_at' => time(),
            'revalidated_at' => time(),
        ]);
    }

    /**
     * A document created on Thu Oct 1 and routed: FIRST receives it Thu and
     * forwards it Mon (2 working days: Thu, Fri), SECOND receives it Mon and
     * closes it the same day (1: the day itself counts, as in the Livewire
     * report). Rolled back in tearDown.
     */
    protected function routed(array $overrides = []): Document
    {
        if (! $this->inTransaction) {
            DB::beginTransaction();
            $this->inTransaction = true;
        }

        $document = Document::create([
            'control_no' => 'DCTT' . uniqid(),
            'source' => 'internal',
            'category_id' => $this->category()->id,
            'subject' => 'Memorandum on the regional assembly',
            'user_id' => 7,
            'office_id' => self::ORIGIN,
            'assigned_to' => self::SECOND,
            'is_arta' => false,
            'is_bundle' => false,
            'status' => 'Closed',
            ...$overrides,
        ]);
        DB::table('documents')->where('id', $document->id)->update(['created_at' => '2026-10-01 08:00:00']);

        foreach ([
            [1, self::FIRST, '2026-10-01 09:00:00'],   // Received
            [3, self::FIRST, '2026-10-05 09:00:00'],   // Forwarded, the next Monday
            [1, self::SECOND, '2026-10-05 10:00:00'],  // Received
            [5, self::SECOND, '2026-10-05 15:00:00'],  // Closed
        ] as [$action, $office, $at]) {
            Log::create([
                'action_id' => $action,
                'document_id' => $document->id,
                'user_id' => 7,
                'office_id' => $office,
                'assigned_to' => $office,
                'description' => 'Test step',
            ])->forceFill(['created_at' => $at])->save();
        }

        return $document;
    }

    /** The same category every time, so its id and name agree. */
    protected function category(): Category
    {
        return Category::orderBy('id')->firstOrFail();
    }

    public function test_guests_are_sent_to_the_login_page(): void
    {
        $this->get('/report-turnaround-time')->assertRedirect(route('login'));
    }

    public function test_each_office_is_charged_only_for_its_own_custody(): void
    {
        $this->routed();

        $this->signedIn()
            ->get('/report-turnaround-time')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('reports/turnaround')
                ->where('defaultRange', ['from' => '2026-09-03', 'to' => '2026-10-02'])
                // Weekend not counted: Thu → Mon is 2 working days.
                ->where('report.offices', fn ($rows) => collect($rows)->firstWhere('id', self::FIRST)['avg'] == 2
                    && collect($rows)->firstWhere('id', self::SECOND)['avg'] == 1
                    // The origin only created it: never measured.
                    && collect($rows)->firstWhere('id', self::ORIGIN) === null));
    }

    public function test_picking_an_office_narrows_the_rows_and_the_summary(): void
    {
        $this->routed();

        $this->signedIn()
            ->get('/report-turnaround-time?office=' . self::FIRST)
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.offices', [(string) self::FIRST])
                ->has('report.offices', 1)
                ->where('report.summary.average', 2)
                ->where('report.summary.fastest', 2)
                ->where('report.facets.offices.' . self::SECOND, 1));
    }

    public function test_an_office_breaks_down_by_category(): void
    {
        $this->routed();

        $this->signedIn()
            ->getJson('/report-turnaround-time/offices/' . self::FIRST)
            ->assertOk()
            ->assertJsonPath('hops', 1)
            ->assertJsonPath('categories.0.name', $this->category()->name)
            ->assertJsonPath('categories.0.avg', 2);
    }
}
