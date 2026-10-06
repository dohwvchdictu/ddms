<?php

namespace Tests\Feature;

use App\Actions\Navigation\SidebarCounts;
use App\Models\Document;
use App\Models\Log;
use App\Services\ApiService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Support\Header;
use Inertia\Testing\AssertableInertia as Assert;
use Mockery\MockInterface;
use Tests\Concerns\LoadsDeferredProps;
use Tests\TestCase;

class IncomingTest extends TestCase
{
    use LoadsDeferredProps;

    /** Office ids no real office uses, so the shared dev data never shows up here. */
    protected const OFFICE = 990001;

    protected const SENDER = 990002;

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
            ['id' => self::SENDER, 'officeCode' => 'RLED', 'officeName' => 'Regulation, Licensing and Enforcement Division'],
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

    /** A document sent from SENDER to OFFICE, with the logs a forward leaves. Rolled back in tearDown. */
    protected function sentHere(array $overrides = []): Document
    {
        if (! $this->inTransaction) {
            DB::beginTransaction();
            $this->inTransaction = true;
        }

        $document = Document::create([
            'control_no' => 'DCIN' . uniqid(),
            'source' => 'internal',
            'category_id' => null,
            'subject' => 'Memorandum on the regional assembly',
            'user_id' => 9,
            'office_id' => self::SENDER,
            'assigned_to' => self::OFFICE,
            'is_arta' => false,
            'is_bundle' => false,
            'status' => 'For Receiving',
            ...$overrides,
        ]);

        Log::create(['action_id' => 3, 'document_id' => $document->id, 'user_id' => 9, 'office_id' => self::SENDER, 'assigned_to' => self::OFFICE, 'description' => 'Forwarded']);

        return $document;
    }

    public function test_guests_are_sent_to_the_login_page(): void
    {
        $this->get('/status-incoming')->assertRedirect(route('login'));
    }

    public function test_only_documents_waiting_here_are_listed(): void
    {
        $waiting = $this->sentHere(['endorsed_to' => 7]);
        $returned = $this->sentHere(['status' => 'Returned']);
        $this->sentHere(['status' => 'On Process']);               // already received
        $this->sentHere(['assigned_to' => self::SENDER]);          // waiting somewhere else
        $this->sentHere(['bundle_id' => $waiting->id]);            // travels with its bundle

        $this->signedIn()
            ->getWithDeferred('/status-incoming')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('incoming/index')
                ->where('documents.total', 2)
                ->where('facets.statuses', ['For Receiving' => 1, 'Returned' => 1])
                ->where('documents.data', fn ($rows) => collect($rows)->pluck('control_no')->sort()->values()->all()
                    === collect([$waiting->control_no, $returned->control_no])->sort()->values()->all()));
    }

    public function test_older_documents_hidden_by_the_dates_are_counted(): void
    {
        $this->sentHere();
        $old = $this->sentHere();
        DB::table('documents')->where('id', $old->id)->update(['updated_at' => now()->subDays(45)]);

        $this->signedIn()
            ->getWithDeferred('/status-incoming')
            ->assertInertia(fn (Assert $page) => $page
                ->where('documents.total', 1)
                ->where('outsideRange', 1));

        $this->signedIn()
            ->getWithDeferred('/status-incoming?from=&to=')
            ->assertInertia(fn (Assert $page) => $page
                ->where('documents.total', 2)
                ->where('outsideRange', 0));
    }

    public function test_rows_carry_the_sender_and_the_endorsement(): void
    {
        $document = $this->sentHere(['endorsed_to' => 7]);

        $this->signedIn()
            ->getWithDeferred('/status-incoming')
            ->assertInertia(fn (Assert $page) => $page
                ->where('documents.data.0.control_no', $document->control_no)
                ->where('documents.data.0.from.name', 'Regulation, Licensing and Enforcement Division')
                ->where('documents.data.0.endorsed_to', 'Juan Dela Cruz')
                ->where('documents.data.0.endorsed_to_me', true));
    }

    public function test_the_status_filter_and_unknown_values_fall_back(): void
    {
        $this->sentHere();
        $this->sentHere(['status' => 'Returned']);

        $this->signedIn()
            ->getWithDeferred('/status-incoming?status=Returned,Bogus&sort=password&type=receipts')
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.statuses', ['Returned'])
                ->where('filters.sort', 'updated_at')
                ->where('filters.type', 'all')
                ->where('documents.total', 1));
    }

    public function test_receiving_moves_documents_and_their_attachments_to_pending(): void
    {
        $bundle = $this->sentHere(['is_bundle' => true]);
        $attachment = $this->sentHere(['bundle_id' => $bundle->id]);

        $this->signedIn()
            ->from('/status-incoming')
            ->post('/status-incoming/receive', ['document_ids' => [$bundle->id]])
            ->assertRedirect('/status-incoming')
            ->assertSessionHas('inertia.flash_data.toast.message', 'Document received');

        foreach ([$bundle, $attachment] as $document) {
            $fresh = $document->fresh();
            $this->assertSame('On Process', $fresh->status);
            $this->assertSame(self::OFFICE, (int) $fresh->assigned_to);
            $this->assertDatabaseHas('logs', ['document_id' => $document->id, 'office_id' => self::OFFICE, 'user_id' => 7]);
        }
    }

    public function test_after_receiving_the_list_reloads_in_place(): void
    {
        $received = $this->sentHere();
        $this->sentHere();
        $version = $this->signedIn()->get('/status-incoming')->viewData('page')['version'];

        // As the page posts it: only the list and the badges, so the redirect back
        // brings them in the same response and the old rows stay up (no skeleton).
        $this->withHeaders([
            Header::VERSION => (string) $version,
            Header::PARTIAL_COMPONENT => 'incoming/index',
            Header::PARTIAL_ONLY => 'filters,documents,facets,outsideRange,sidebarCounts',
        ])
            ->followingRedirects()
            ->from('/status-incoming')
            ->post('/status-incoming/receive', ['document_ids' => [$received->id]])
            ->assertInertia(fn (Assert $page) => $page
                ->component('incoming/index')
                ->where('documents.total', 1)
                ->has('sidebarCounts')
                ->missing('statusOptions'));
    }

    public function test_documents_waiting_elsewhere_cannot_be_received(): void
    {
        $elsewhere = $this->sentHere(['assigned_to' => self::SENDER]);

        $this->signedIn()
            ->post('/status-incoming/receive', ['document_ids' => [$elsewhere->id]])
            ->assertSessionHas('inertia.flash_data.toast.type', 'warning');

        $this->assertSame('For Receiving', $elsewhere->fresh()->status);
    }

    public function test_select_every_match_returns_the_filtered_rows(): void
    {
        $this->sentHere();
        $returned = $this->sentHere(['status' => 'Returned']);

        $this->signedIn()
            ->getJson('/status-incoming/selectable?status=Returned')
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('rows.0.id', $returned->id);
    }
}
