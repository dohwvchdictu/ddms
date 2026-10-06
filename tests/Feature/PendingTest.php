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
use Tests\Concerns\LoadsDeferredProps;
use Tests\TestCase;

class PendingTest extends TestCase
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

        $offices = [
            ['id' => self::OFFICE, 'officeCode' => 'KMICT', 'officeName' => 'Knowledge Management and ICT Unit'],
            ['id' => self::OTHER, 'officeCode' => 'RLED', 'officeName' => 'Regulation, Licensing and Enforcement Division'],
        ];

        $this->mock(ApiService::class, function (MockInterface $mock) use ($offices) {
            $mock->shouldReceive('getOfficesData')->andReturn(['officeList' => $offices]);
            $mock->shouldReceive('getActiveOffices')->andReturn($offices);
            $mock->shouldReceive('getEmployeesData')->andReturn(['employeesList' => [
                ['id' => 7, 'firstName' => 'Juan', 'lastName' => 'Dela Cruz', 'suffix' => '', 'office' => ['id' => self::OFFICE]],
                ['id' => 8, 'firstName' => 'Ana', 'lastName' => 'Reyes', 'suffix' => '', 'office' => ['id' => self::OFFICE]],
                ['id' => 21, 'firstName' => 'Maria', 'lastName' => 'Santos', 'suffix' => '', 'office' => ['id' => self::OTHER]],
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

    /** A document received here and on process, with a Created log. Rolled back in tearDown. */
    protected function onProcess(array $overrides = []): Document
    {
        if (! $this->inTransaction) {
            DB::beginTransaction();
            $this->inTransaction = true;
        }

        $document = Document::create([
            'control_no' => 'DCPD' . uniqid(),
            'source' => 'internal',
            'category_id' => null,
            'subject' => 'Memorandum on the regional assembly',
            'user_id' => 21,
            'office_id' => self::OTHER,
            'assigned_to' => self::OFFICE,
            'is_arta' => false,
            'is_bundle' => false,
            'status' => 'On Process',
            ...$overrides,
        ]);

        // created_at isn't fillable on Log, so it's set after the fact: encoded the Monday before.
        Log::create(['action_id' => Action::where('name', 'Created')->value('id'), 'document_id' => $document->id, 'user_id' => 21, 'office_id' => self::OTHER, 'description' => 'Created'])
            ->forceFill(['created_at' => '2026-09-28 09:00:00'])
            ->save();

        return $document;
    }

    public function test_guests_are_sent_to_the_login_page(): void
    {
        $this->get('/status-pending')->assertRedirect(route('login'));
    }

    public function test_only_documents_on_process_here_are_listed(): void
    {
        $mine = $this->onProcess(['endorsed_to' => 7]);
        $this->onProcess();
        $this->onProcess(['status' => 'For Receiving']);   // not received yet
        $this->onProcess(['assigned_to' => self::OTHER]);   // elsewhere
        $this->onProcess(['bundle_id' => $mine->id]);       // inside a bundle

        $this->signedIn()
            ->getWithDeferred('/status-pending')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('pending/index')
                ->where('documents.total', 2)
                ->where('facets.endorsed', ['me' => 1])
                ->where('closePasswordThreshold', 5));

        $this->signedIn()
            ->getWithDeferred('/status-pending?endorsed=me')
            ->assertInertia(fn (Assert $page) => $page
                ->where('documents.total', 1)
                ->where('documents.data.0.control_no', $mine->control_no)
                ->where('documents.data.0.endorsed_to_me', true));
    }

    public function test_older_documents_hidden_by_the_dates_are_counted(): void
    {
        $this->onProcess();
        $old = $this->onProcess();
        DB::table('documents')->where('id', $old->id)->update(['updated_at' => now()->subDays(45)]);

        $this->signedIn()
            ->getWithDeferred('/status-pending')
            ->assertInertia(fn (Assert $page) => $page
                ->where('documents.total', 1)
                ->where('outsideRange', 1));

        // Any date: nothing hidden.
        $this->signedIn()
            ->getWithDeferred('/status-pending?from=&to=')
            ->assertInertia(fn (Assert $page) => $page
                ->where('documents.total', 2)
                ->where('outsideRange', 0));
    }

    public function test_forwarding_from_pending_sends_them_on(): void
    {
        $document = $this->onProcess();

        $this->signedIn()
            ->from('/status-pending')
            ->post('/status-pending/forward', ['document_ids' => [$document->id], 'assigned_to' => self::OTHER, 'endorsed_to' => 21, 'remarks' => 'For signature'])
            ->assertRedirect('/status-pending');

        $fresh = $document->fresh();
        $this->assertSame('For Receiving', $fresh->status);
        $this->assertSame(self::OTHER, (int) $fresh->assigned_to);
        $this->assertSame(21, (int) $fresh->endorsed_to);
    }

    public function test_endorsing_hands_them_to_a_colleague(): void
    {
        $bundle = $this->onProcess(['is_bundle' => true]);
        $inside = $this->onProcess(['bundle_id' => $bundle->id]);

        $this->signedIn()
            ->post('/status-pending/endorse', ['document_ids' => [$bundle->id], 'endorsed_to' => 8, 'remarks' => 'Document has been checked.'])
            ->assertSessionHas('inertia.flash_data.toast.message', 'Document endorsed to Ana Reyes');

        $this->assertSame(8, (int) $bundle->fresh()->endorsed_to);
        $this->assertSame(8, (int) $inside->fresh()->endorsed_to);
        $this->assertDatabaseHas('logs', ['document_id' => $bundle->id, 'endorsed_to' => 8, 'remarks' => 'Document has been checked.']);
    }

    public function test_endorsing_outside_the_office_or_without_a_note_is_refused(): void
    {
        $document = $this->onProcess();

        $this->signedIn()
            ->post('/status-pending/endorse', ['document_ids' => [$document->id], 'endorsed_to' => 21, 'remarks' => ''])
            ->assertSessionHasErrors(['endorsed_to', 'remarks']);
    }

    public function test_endorsing_to_the_same_person_again_changes_nothing(): void
    {
        $document = $this->onProcess(['endorsed_to' => 8]);

        $this->signedIn()
            ->post('/status-pending/endorse', ['document_ids' => [$document->id], 'endorsed_to' => 8, 'remarks' => 'Again'])
            ->assertSessionHas('inertia.flash_data.toast.message', 'No changes');
    }

    /** Signed in, with a close code already issued (as GET close-code would). */
    protected function withCode(string $code = 'K7PM3X'): self
    {
        return $this->signedIn()->withSession(['pending.close_code' => $code]);
    }

    public function test_the_close_code_comes_from_the_server(): void
    {
        $this->signedIn()
            ->getJson('/status-pending/close-code')
            ->assertOk()
            ->assertJson(fn ($json) => $json->where('code', fn ($code) => preg_match('/^[A-HJKMNP-Z2-9]{6}$/', $code) === 1))
            ->assertSessionHas('pending.close_code');
    }

    public function test_a_few_documents_need_the_code_shown(): void
    {
        $document = $this->onProcess();

        $this->withCode()
            ->post('/status-pending/close', ['document_ids' => [$document->id], 'remarks' => 'Done', 'code' => 'WRONG1'])
            ->assertSessionHasErrors('code');

        $this->assertSame('On Process', $document->fresh()->status);
    }

    public function test_closing_ends_the_route_and_records_turnaround(): void
    {
        $document = $this->onProcess();

        $this->withCode()
            // Typed in lower case: the code isn't case-sensitive.
            ->post('/status-pending/close', ['document_ids' => [$document->id], 'remarks' => 'Document has been approved.', 'code' => 'k7pm3x'])
            ->assertSessionHas('inertia.flash_data.toast.message', 'Document closed')
            // Used up: the next close gets a new one.
            ->assertSessionMissing('pending.close_code');

        $fresh = $document->fresh();
        $this->assertSame('Closed', $fresh->status);
        // Created Mon Sep 28, closed Fri Oct 2: the weekdays it was open (Mon to Fri),
        // counted as the Livewire page counted them, so existing figures stay comparable.
        $this->assertSame(5, (int) $fresh->turnaroundtime);
    }

    /** @return list<int> Five documents on process here. */
    protected function aBatch(): array
    {
        return array_map(fn () => $this->onProcess()->id, range(1, 5));
    }

    public function test_five_or_more_need_the_hris_password(): void
    {
        $ids = $this->aBatch();

        // A code isn't enough for a batch.
        $this->withCode()
            ->post('/status-pending/close', ['document_ids' => $ids, 'remarks' => 'Done', 'code' => 'K7PM3X'])
            ->assertSessionHasErrors('password');

        app(ApiService::class)->shouldReceive('login')->once()
            ->with(['email' => 'juan@doh.gov.ph', 'password' => 'secret-pass'])
            ->andReturn(['success' => true, 'data' => []]);

        $this->signedIn()
            ->withSession(['auth_email' => 'juan@doh.gov.ph'])
            ->post('/status-pending/close', ['document_ids' => $ids, 'remarks' => 'Done', 'password' => 'secret-pass'])
            ->assertSessionHas('inertia.flash_data.toast.message', '5 documents closed');

        $this->assertSame(5, Document::whereIn('id', $ids)->where('status', 'Closed')->count());
    }

    public function test_a_wrong_password_closes_nothing(): void
    {
        $ids = $this->aBatch();

        app(ApiService::class)->shouldReceive('login')->once()->andReturn(['success' => false, 'error' => 'invalid_credentials']);

        $this->signedIn()
            ->withSession(['auth_email' => 'juan@doh.gov.ph'])
            ->post('/status-pending/close', ['document_ids' => $ids, 'remarks' => 'Done', 'password' => 'guess'])
            ->assertSessionHasErrors(['password' => 'That password is not correct.']);

        $this->assertSame(0, Document::whereIn('id', $ids)->where('status', 'Closed')->count());
    }

    public function test_documents_elsewhere_cannot_be_closed(): void
    {
        $elsewhere = $this->onProcess(['assigned_to' => self::OTHER]);

        $this->withCode()
            ->post('/status-pending/close', ['document_ids' => [$elsewhere->id], 'remarks' => 'Done', 'code' => 'K7PM3X'])
            ->assertSessionHas('inertia.flash_data.toast.type', 'warning');

        $this->assertSame('On Process', $elsewhere->fresh()->status);
    }
}
