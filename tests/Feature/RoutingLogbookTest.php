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

class RoutingLogbookTest extends TestCase
{
    /** Office ids no real office uses, so the shared dev data never shows up here. */
    protected const OFFICE = 990001;

    protected const DESTINATION = 990002;

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
            ['id' => self::DESTINATION, 'officeCode' => 'RLED', 'officeName' => 'Regulation, Licensing and Enforcement Division'],
        ];

        $this->mock(ApiService::class, function (MockInterface $mock) use ($offices) {
            $mock->shouldReceive('getOfficesData')->andReturn(['officeList' => $offices]);
            $mock->shouldReceive('getActiveOffices')->andReturn($offices);
            $mock->shouldReceive('getEmployeesData')->andReturn(['employeesList' => [
                ['id' => 7, 'firstName' => 'Juan', 'lastName' => 'Dela Cruz', 'suffix' => '', 'office' => ['id' => self::OFFICE]],
                ['id' => 8, 'firstName' => 'Ana', 'lastName' => 'Reyes', 'suffix' => '', 'office' => ['id' => self::DESTINATION]],
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

    /** A document OFFICE forwarded to DESTINATION, with its "For Receiving" log. Rolled back in tearDown. */
    protected function forwarded(string $at = '2026-10-02 08:00:00', array $overrides = []): Document
    {
        if (! $this->inTransaction) {
            DB::beginTransaction();
            $this->inTransaction = true;
        }

        $document = Document::create([
            'control_no' => 'DCRL' . uniqid(),
            'source' => 'internal',
            'category_id' => null,
            'subject' => 'Memorandum on the regional assembly',
            'user_id' => 7,
            'office_id' => self::OFFICE,
            'assigned_to' => self::DESTINATION,
            'is_arta' => false,
            'is_bundle' => false,
            'status' => 'For Receiving',
            ...$overrides,
        ]);

        $this->log($document, 'For Receiving', self::OFFICE, self::DESTINATION, $at, 7);

        return $document;
    }

    protected function log(Document $document, string $action, int $by, int $to, string $at, int $userId, ?int $bundleId = null): void
    {
        Log::create([
            'action_id' => Action::where('name', $action)->value('id'),
            'document_id' => $document->id,
            'bundle_id' => $bundleId,
            'user_id' => $userId,
            'office_id' => $by,
            'assigned_to' => $to,
            'description' => $action,
        ])->forceFill(['created_at' => $at])->save();
    }

    public function test_guests_are_sent_to_the_login_page(): void
    {
        $this->get('/routing-logbook')->assertRedirect(route('login'));
    }

    public function test_each_hand_over_shows_its_receipt(): void
    {
        $awaiting = $this->forwarded('2026-10-02 08:00:00');
        $received = $this->forwarded('2026-10-02 07:00:00');
        $this->log($received, 'Received', self::DESTINATION, self::DESTINATION, '2026-10-02 07:45:00', 8);
        $returned = $this->forwarded('2026-10-01 15:00:00');
        $this->log($returned, 'Returned', self::DESTINATION, self::OFFICE, '2026-10-01 16:00:00', 8);

        $this->signedIn()
            ->get('/routing-logbook')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('routing-logbook/index')
                ->where('counts', ['all' => 3, 'awaiting' => 1, 'received' => 1, 'returned' => 1])
                ->where('entries.data.0.control_no', $awaiting->control_no)
                ->where('entries.data.0.receipt', 'awaiting')
                ->where('entries.data.0.to.name', 'Regulation, Licensing and Enforcement Division')
                ->where('entries.data.1.control_no', $received->control_no)
                ->where('entries.data.1.receipt', 'received')
                ->where('entries.data.1.received_by', 'Ana Reyes')
                ->where('entries.data.2.receipt', 'returned'));
    }

    public function test_the_receipt_tab_filters_rows(): void
    {
        $this->forwarded();
        $received = $this->forwarded();
        $this->log($received, 'Received', self::DESTINATION, self::DESTINATION, '2026-10-02 09:00:00', 8);

        $this->signedIn()
            ->get('/routing-logbook?receipt=received')
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.receipt', 'received')
                ->where('entries.total', 1)
                ->where('entries.data.0.control_no', $received->control_no)
                ->where('counts.all', 2));
    }

    public function test_a_second_hand_over_to_the_same_office_waits_for_its_own_receipt(): void
    {
        $document = $this->forwarded('2026-10-01 08:00:00');
        $this->log($document, 'Received', self::DESTINATION, self::DESTINATION, '2026-10-01 09:00:00', 8);
        $this->log($document, 'For Receiving', self::OFFICE, self::DESTINATION, '2026-10-02 08:00:00', 7);

        $this->signedIn()
            ->get('/routing-logbook')
            ->assertInertia(fn (Assert $page) => $page
                ->where('entries.data.0.receipt', 'awaiting')
                ->where('entries.data.1.receipt', 'received'));
    }

    public function test_by_default_only_the_last_7_days_are_shown(): void
    {
        $this->forwarded('2026-10-02 08:00:00');
        $this->forwarded('2026-09-26 08:00:00');
        $this->forwarded('2026-09-25 08:00:00');

        $this->signedIn()
            ->get('/routing-logbook')
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.from', '2026-09-26')
                ->where('filters.to', '2026-10-02')
                ->where('defaultRange', ['from' => '2026-09-26', 'to' => '2026-10-02'])
                ->where('entries.total', 2));

        // Empty dates mean any date.
        $this->signedIn()
            ->get('/routing-logbook?from=&to=')
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.from', null)
                ->where('entries.total', 3));
    }

    public function test_bundle_contents_and_other_offices_are_left_out(): void
    {
        $bundle = $this->forwarded(overrides: ['is_bundle' => true]);
        $inside = $this->forwarded(overrides: ['bundle_id' => $bundle->id]);
        Log::where('document_id', $inside->id)->update(['bundle_id' => $bundle->id]);
        $elsewhere = $this->forwarded();
        Log::where('document_id', $elsewhere->id)->update(['office_id' => self::DESTINATION]);

        $this->signedIn()
            ->get('/routing-logbook')
            ->assertInertia(fn (Assert $page) => $page
                ->where('entries.total', 1)
                ->where('entries.data.0.control_no', $bundle->control_no)
                ->where('entries.data.0.is_bundle', true));
    }

    public function test_search_and_unknown_values_fall_back(): void
    {
        $match = $this->forwarded(overrides: ['subject' => 'Budget hearing schedule']);
        $this->forwarded();

        $this->signedIn()
            ->get('/routing-logbook?search=budget&receipt=bogus&sort=password&per_page=7')
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.receipt', 'all')
                ->where('filters.sort', '-created_at')
                ->where('filters.per_page', 25)
                ->where('entries.total', 1)
                ->where('entries.data.0.control_no', $match->control_no));
    }
}
