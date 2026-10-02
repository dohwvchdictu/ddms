<?php

namespace Tests\Feature;

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

class ProcessedTest extends TestCase
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

    /** A document with one step logged at `$office`. Rolled back in tearDown. */
    protected function processed(string $action = 'Forwarded', string $at = '2026-10-02 08:00:00', array $overrides = [], int $office = self::OFFICE): Document
    {
        if (! $this->inTransaction) {
            DB::beginTransaction();
            $this->inTransaction = true;
        }

        $document = Document::create([
            'control_no' => 'DCPR' . uniqid(),
            'source' => 'internal',
            'category_id' => null,
            'subject' => 'Memorandum on the regional assembly',
            'user_id' => 7,
            'office_id' => self::OFFICE,
            'assigned_to' => $action === 'Closed' ? self::OFFICE : self::OTHER,
            'is_arta' => false,
            'is_bundle' => false,
            'status' => $action === 'Closed' ? 'Closed' : 'For Receiving',
            ...$overrides,
        ]);

        $this->step($document, $action, $at, $office);

        return $document;
    }

    protected function step(Document $document, string $action, string $at, int $office = self::OFFICE): void
    {
        Log::create([
            'action_id' => Action::where('name', $action)->value('id'),
            'document_id' => $document->id,
            'user_id' => 7,
            'office_id' => $office,
            'assigned_to' => $office,
            'description' => $action,
        ])->forceFill(['created_at' => $at])->save();
    }

    public function test_guests_are_sent_to_the_login_page(): void
    {
        $this->get('/status-forwarded')->assertRedirect(route('login'));
    }

    public function test_forwarded_and_closed_documents_are_listed_newest_first(): void
    {
        $closed = $this->processed('Closed', '2026-10-01 10:00:00');
        $forwarded = $this->processed('Forwarded', '2026-10-02 08:00:00');
        $this->processed('Forwarded', overrides: [], office: self::OTHER);              // another office's work
        $this->processed('Received');                                                   // not a processing step
        $this->processed(overrides: ['bundle_id' => $forwarded->id]);                   // travels with its bundle

        $this->signedIn()
            ->get('/status-forwarded')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('processed/index')
                ->where('documents.total', 2)
                ->where('documents.data.0.control_no', $forwarded->control_no)
                ->where('documents.data.0.step', 'Forwarded')
                ->where('documents.data.0.selectable', true)
                ->where('documents.data.0.processed_by', 'Juan Dela Cruz')
                ->where('documents.data.0.now_at.name', 'Regulation, Licensing and Enforcement Division')
                ->where('documents.data.1.control_no', $closed->control_no)
                ->where('documents.data.1.step', 'Closed')
                ->where('documents.data.1.selectable', false)
                ->where('documents.data.1.now_at.name', 'Knowledge Management and ICT Unit')
                ->where('facets.statuses.For Receiving', 1)
                ->where('facets.statuses.Closed', 1));
    }

    public function test_the_latest_step_here_is_shown_and_filtered_on(): void
    {
        $document = $this->processed('Forwarded', '2026-09-01 08:00:00');
        $this->step($document, 'Forwarded', '2026-10-02 08:00:00');

        $this->signedIn()
            ->get('/status-forwarded?from=2026-10-01&to=2026-10-02')
            ->assertInertia(fn (Assert $page) => $page
                ->where('documents.total', 1)
                ->where('documents.data.0.processed_at', '2026-10-02T08:00:00+08:00'));

        $this->signedIn()
            ->get('/status-forwarded?from=2026-09-01&to=2026-09-02')
            ->assertInertia(fn (Assert $page) => $page->where('documents.total', 0));
    }

    public function test_by_default_only_the_last_30_days_are_shown(): void
    {
        $this->processed(at: '2026-10-02 08:00:00');
        $this->processed(at: '2026-09-03 08:00:00');
        $this->processed(at: '2026-09-02 08:00:00');

        $this->signedIn()
            ->get('/status-forwarded')
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.from', '2026-09-03')
                ->where('filters.to', '2026-10-02')
                ->where('defaultRange', ['from' => '2026-09-03', 'to' => '2026-10-02'])
                ->where('documents.total', 2));

        // Empty dates mean any date.
        $this->signedIn()
            ->get('/status-forwarded?from=&to=')
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.from', null)
                ->where('documents.total', 3));
    }

    public function test_status_search_and_unknown_values_fall_back(): void
    {
        $match = $this->processed(overrides: ['subject' => 'Budget hearing schedule']);
        $this->processed('Closed');

        $this->signedIn()
            ->get('/status-forwarded?search=budget&status=For Receiving,Bogus&sort=password&per_page=7')
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.statuses', ['For Receiving'])
                ->where('filters.sort', '-processed_at')
                ->where('filters.per_page', 25)
                ->where('documents.total', 1)
                ->where('documents.data.0.control_no', $match->control_no));
    }

    public function test_select_every_match_only_takes_logbook_documents(): void
    {
        $receiving = $this->processed();
        $this->processed('Closed');

        $this->signedIn()
            ->getJson('/status-forwarded/selectable')
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('rows.0.id', $receiving->id);
    }
}
