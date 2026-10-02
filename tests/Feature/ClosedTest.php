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

class ClosedTest extends TestCase
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

        $this->mock(ApiService::class, function (MockInterface $mock) {
            $mock->shouldReceive('getOfficesData')->andReturn(['officeList' => []]);
            $mock->shouldReceive('getActiveOffices')->andReturn([]);
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

    /** A document with a "Closed" log at `$office`. Rolled back in tearDown. */
    protected function closed(string $at = '2026-10-02 08:00:00', array $overrides = [], int $office = self::OFFICE, string $action = 'Closed', ?string $remarks = 'Signed and filed.'): Document
    {
        if (! $this->inTransaction) {
            DB::beginTransaction();
            $this->inTransaction = true;
        }

        $document = Document::create([
            'control_no' => 'DCCL' . uniqid(),
            'source' => 'internal',
            'category_id' => null,
            'subject' => 'Memorandum on the regional assembly',
            'user_id' => 7,
            'office_id' => $office,
            'assigned_to' => $office,
            'is_arta' => false,
            'is_bundle' => false,
            'status' => 'Closed',
            'turnaroundtime' => 3,
            ...$overrides,
        ]);

        Log::create([
            'action_id' => Action::where('name', $action)->value('id'),
            'document_id' => $document->id,
            'user_id' => 7,
            'office_id' => $office,
            'assigned_to' => $office,
            'description' => $action,
            'remarks' => $remarks,
        ])->forceFill(['created_at' => $at])->save();

        return $document;
    }

    public function test_guests_are_sent_to_the_login_page(): void
    {
        $this->get('/status-closed')->assertRedirect(route('login'));
    }

    public function test_documents_closed_here_are_listed_newest_first(): void
    {
        $older = $this->closed('2026-10-01 10:00:00');
        $newer = $this->closed('2026-10-02 08:00:00', remarks: null);
        $this->closed(office: self::OTHER);                                    // closed elsewhere
        $this->closed(action: 'Forwarded');                                    // not a close
        $this->closed(overrides: ['bundle_id' => $older->id]);                 // closed with its bundle

        $this->signedIn()
            ->get('/status-closed')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('closed/index')
                ->where('documents.total', 2)
                ->where('documents.data.0.control_no', $newer->control_no)
                ->where('documents.data.0.remarks', null)
                ->where('documents.data.1.control_no', $older->control_no)
                ->where('documents.data.1.remarks', 'Signed and filed.')
                ->where('documents.data.1.closed_by', 'Juan Dela Cruz')
                ->where('documents.data.1.turnaround', 3)
                ->where('facets.types.all', 2));
    }

    public function test_by_default_only_the_last_30_days_are_shown(): void
    {
        $this->closed('2026-10-02 08:00:00');
        $this->closed('2026-09-03 08:00:00');
        $this->closed('2026-09-02 08:00:00');

        $this->signedIn()
            ->get('/status-closed')
            ->assertInertia(fn (Assert $page) => $page
                ->where('defaultRange', ['from' => '2026-09-03', 'to' => '2026-10-02'])
                ->where('documents.total', 2));

        $this->signedIn()
            ->get('/status-closed?from=&to=')
            ->assertInertia(fn (Assert $page) => $page->where('documents.total', 3));
    }

    public function test_search_and_unknown_values_fall_back(): void
    {
        $match = $this->closed(overrides: ['subject' => 'Budget hearing schedule']);
        $this->closed();

        $this->signedIn()
            ->get('/status-closed?search=budget&sort=password&per_page=7&type=receipts')
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.sort', '-closed_at')
                ->where('filters.per_page', 25)
                ->where('filters.type', 'all')
                ->where('documents.total', 1)
                ->where('documents.data.0.control_no', $match->control_no));
    }
}
