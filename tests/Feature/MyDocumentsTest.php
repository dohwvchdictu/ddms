<?php

namespace Tests\Feature;

use App\Actions\Documents\CreateDocument;
use App\Actions\Documents\OfficeDocuments;
use App\Actions\Navigation\SidebarCounts;
use App\Http\Controllers\MyDocumentsController;
use App\Models\Category;
use App\Models\Document;
use App\Services\ApiService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Mockery\MockInterface;
use Tests\TestCase;

class MyDocumentsTest extends TestCase
{
    /** An office id no real office uses, so dev data never shows up in these lists. */
    protected const OFFICE = 990001;

    /** Set by the tests that write; rolled back in tearDown (the dev database is shared). */
    protected bool $inTransaction = false;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow('2026-10-01 09:30:00');

        $this->mock(SidebarCounts::class, fn (MockInterface $mock) => $mock->shouldReceive('handle')->andReturn([
            'incoming' => 0, 'pending' => 0, 'endorsed' => 0, 'total' => 0,
        ]));
        $rled = ['id' => 12, 'officeCode' => 'RLED', 'officeName' => 'Regulation, Licensing and Enforcement Division'];

        $this->mock(ApiService::class, function (MockInterface $mock) use ($rled) {
            $mock->shouldReceive('getOfficesData')->andReturn(['officeList' => [$rled]]);
            $mock->shouldReceive('getActiveOffices')->andReturn([$rled]);
            $mock->shouldReceive('getEmployeesData')->andReturn(['employeesList' => [
                ['id' => 7, 'firstName' => 'Juan', 'lastName' => 'Dela Cruz', 'suffix' => '', 'office' => ['id' => self::OFFICE]],
                ['id' => 21, 'firstName' => 'Maria', 'lastName' => 'Santos', 'suffix' => '', 'office' => ['id' => 12]],
                ['id' => 22, 'firstName' => 'Ana', 'lastName' => 'Abad', 'suffix' => '', 'office' => ['id' => 12]],
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
            'user' => ['id' => 7, 'firstName' => 'Juan', 'lastName' => 'Dela Cruz', 'suffix' => '', 'office' => ['id' => self::OFFICE]],
            'token_created_at' => time(),
            'revalidated_at' => time(),
        ]);
    }

    /** The filters the page opens with, with some replaced. */
    protected static function filters(array $overrides = []): array
    {
        return [
            'type' => 'all',
            'search' => '',
            'statuses' => [],
            'from' => '2026-09-02',
            'to' => '2026-10-01',
            'sort' => '-created_at',
            'per_page' => 25,
            ...$overrides,
        ];
    }

    /** The list's query and facets, stubbed to match nothing, expecting these filters. */
    protected function expectFilters(array $filters): void
    {
        $this->mock(OfficeDocuments::class, function (MockInterface $mock) use ($filters) {
            $mock->shouldReceive('query')->once()->with(self::OFFICE, $filters)->andReturn(Document::query()->whereRaw('1 = 0'));
            $mock->shouldReceive('facets')->once()->with(self::OFFICE, $filters)->andReturn([
                'statuses' => [],
            ]);
        });
    }

    public function test_guests_are_sent_to_the_login_page(): void
    {
        $this->get('/my-documents')->assertRedirect(route('login'));
    }

    public function test_it_opens_on_the_last_30_days(): void
    {
        $this->expectFilters(self::filters());

        $this->signedIn()
            ->get('/my-documents')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('my-documents/index')
                ->where('filters', self::filters())
                ->where('statusOptions', OfficeDocuments::STATUSES)
                ->where('perPageOptions', MyDocumentsController::PER_PAGE_OPTIONS)
                ->has('facets.statuses')
                ->where('documents.total', 0));
    }

    public function test_filters_come_from_the_query_string(): void
    {
        // Unknown values are dropped; blank dates mean "any date", not the default month.
        $this->expectFilters(self::filters([
            'search' => 'memo',
            'statuses' => ['Created', 'Closed'],
            'from' => null,
            'to' => null,
            'sort' => 'control_no',
            'per_page' => 50,
        ]));

        $this->signedIn()
            ->get('/my-documents?search=+memo+&status=Created,Bogus,Closed&from=&to=&sort=control_no&per_page=50')
            ->assertOk();
    }

    public function test_an_unknown_sort_or_page_size_falls_back_to_the_defaults(): void
    {
        $this->expectFilters(self::filters());

        $this->signedIn()->get('/my-documents?sort=password&per_page=100000')->assertOk();
    }

    public function test_a_malformed_date_is_ignored(): void
    {
        $this->expectFilters(self::filters(['from' => '2026-09-15', 'to' => null]));

        $this->signedIn()->get('/my-documents?from=2026-09-15&to=yesterday')->assertOk();
    }

    public function test_status_counts_ignore_the_status_filter_but_honour_the_rest(): void
    {
        $this->saveDocument(['control_no' => 'DC1', 'subject' => 'Memorandum on the assembly']);
        $this->saveDocument(['control_no' => 'DC2', 'subject' => 'Memorandum on travel', 'status' => 'Closed']);
        $this->saveDocument(['control_no' => 'DC3', 'subject' => 'Letter of request', 'status' => 'Closed']);

        $facets = app(OfficeDocuments::class)->facets(self::OFFICE, self::filters(['statuses' => ['Closed'], 'search' => 'Memorandum']));

        $this->assertSame(['Created' => 1, 'For Receiving' => 0, 'On Process' => 0, 'Returned' => 0, 'Closed' => 1], $facets['statuses']);
        // The tabs honour the search and status filters too: only DC2 is a closed memorandum.
        $this->assertSame(['all' => 1, 'documents' => 1, 'purchase_requests' => 0, 'payments' => 0], $facets['types']);
    }

    public function test_rows_carry_what_the_table_shows(): void
    {
        $document = $this->saveDocument(['assigned_to' => 12, 'status' => 'For Receiving']);

        $this->signedIn()
            ->get('/my-documents')
            ->assertInertia(fn (Assert $page) => $page
                ->where('documents.total', 1)
                ->where('documents.data.0.control_no', $document->control_no)
                ->where('documents.data.0.status', 'For Receiving')
                ->where('documents.data.0.destination', ['code' => 'RLED', 'name' => 'Regulation, Licensing and Enforcement Division'])
                ->where('documents.data.0.encoded_by', 'Juan Dela Cruz')
                ->where('documents.data.0.can_print', true)
                ->where('documents.data.0.turnaround_days', null));
    }

    /** A purchase request, a payment and a plain document, or a skip when the categories are missing. */
    protected function oneOfEachType(): array
    {
        $purchase = Category::where('name', 'like', '%Purchase%')->value('id');
        $payment = Category::where('name', 'like', '%Payment%')->where('name', 'not like', '%Purchase%')->value('id');

        if ($purchase === null || $payment === null) {
            $this->markTestSkipped('No purchase request or payment category in this database.');
        }

        return [
            'purchase_requests' => $this->saveDocument(['control_no' => 'DC3720261001093001', 'category_id' => $purchase]),
            'payments' => $this->saveDocument(['control_no' => 'DC3720261001093002', 'category_id' => $payment]),
            'documents' => $this->saveDocument(['control_no' => 'DC3720261001093003']),
        ];
    }

    public function test_each_tab_lists_its_own_kind_and_all_lists_everything(): void
    {
        $documents = $this->oneOfEachType();

        foreach (['purchase_requests', 'payments', 'documents'] as $type) {
            $this->signedIn()
                ->get("/my-documents?type={$type}")
                ->assertInertia(fn (Assert $page) => $page
                    ->where('filters.type', $type)
                    ->where('documents.total', 1)
                    ->where('documents.data.0.control_no', $documents[$type]->control_no)
                    ->where('facets.types', ['all' => 3, 'documents' => 1, 'purchase_requests' => 1, 'payments' => 1]));
        }

        $this->signedIn()
            ->get('/my-documents')
            ->assertInertia(fn (Assert $page) => $page->where('filters.type', 'all')->where('documents.total', 3));
    }

    public function test_an_unknown_type_falls_back_to_all(): void
    {
        $this->signedIn()
            ->get('/my-documents?type=receipts')
            ->assertInertia(fn (Assert $page) => $page->where('filters.type', 'all'));
    }

    public function test_a_purchase_request_can_be_forwarded(): void
    {
        $purchase = $this->oneOfEachType()['purchase_requests'];

        $this->assertSame(
            [$purchase->id],
            app(OfficeDocuments::class)->forwardable(self::OFFICE)->where('documents.id', $purchase->id)->pluck('documents.id')->all(),
        );
    }

    public function test_the_old_lists_redirect_to_their_tabs(): void
    {
        $this->signedIn()->get('/my-purchase-requests')->assertStatus(301)->assertRedirect('/my-documents?type=purchase_requests');
        $this->signedIn()->get('/my-payments')->assertStatus(301)->assertRedirect('/my-documents?type=payments');
    }

    public function test_a_new_document_lands_on_its_tab(): void
    {
        $documents = $this->oneOfEachType();

        $this->assertSame('/my-documents?type=purchase_requests', CreateDocument::listPath($documents['purchase_requests']));
        $this->assertSame('/my-documents?type=payments', CreateDocument::listPath($documents['payments']));
        $this->assertSame('/my-documents', CreateDocument::listPath($documents['documents']));
    }

    public function test_another_offices_documents_are_not_listed(): void
    {
        $this->saveDocument(['office_id' => self::OFFICE + 1]);

        $this->signedIn()
            ->get('/my-documents')
            ->assertInertia(fn (Assert $page) => $page->where('documents.total', 0));
    }

    public function test_only_top_level_created_or_for_receiving_rows_are_selectable(): void
    {
        $created = $this->saveDocument(['control_no' => 'DC1']);
        $this->saveDocument(['control_no' => 'DC2', 'status' => 'On Process']);
        $this->saveDocument(['control_no' => 'DC3', 'bundle_id' => $created->id]);

        $this->signedIn()
            ->get('/my-documents')
            ->assertInertia(fn (Assert $page) => $page
                // == rather than ===: rows come newest first, and only the flags matter here.
                ->where('documents.data', fn ($rows) => collect($rows)->pluck('selectable', 'control_no')->all() == [
                    'DC1' => true, 'DC2' => false, 'DC3' => false,
                ])
                ->where('offices.0.code', 'RLED'));
    }

    public function test_select_all_matching_returns_every_selectable_row_under_the_filters(): void
    {
        $this->saveDocument(['control_no' => 'DC1', 'subject' => 'Memorandum on the assembly']);
        $this->saveDocument(['control_no' => 'DC2', 'subject' => 'Memorandum on travel', 'status' => 'For Receiving']);
        $this->saveDocument(['control_no' => 'DC3', 'subject' => 'Memorandum, closed', 'status' => 'Closed']);
        $this->saveDocument(['control_no' => 'DC4', 'subject' => 'Letter of request']);

        $this->signedIn()
            ->getJson('/my-documents/selectable?search=Memorandum')
            ->assertOk()
            ->assertJsonPath('total', 2)
            ->assertJsonCount(2, 'rows')
            ->assertJsonPath('rows.0.selectable', true);
    }

    public function test_office_employees_are_listed_last_name_first(): void
    {
        $this->signedIn()
            ->getJson('/offices/12/employees')
            ->assertOk()
            ->assertExactJson([
                ['id' => 22, 'name' => 'Abad, Ana'],
                ['id' => 21, 'name' => 'Santos, Maria'],
            ]);
    }

    public function test_forwarding_hands_documents_and_their_attachments_to_the_office(): void
    {
        $bundle = $this->saveDocument(['control_no' => 'DCB', 'is_bundle' => true]);
        $attachment = $this->saveDocument(['control_no' => 'DCA', 'bundle_id' => $bundle->id, 'status' => 'On Process', 'assigned_to' => self::OFFICE]);

        $this->signedIn()
            ->from('/my-documents')
            ->post('/my-documents/forward', [
                'document_ids' => [$bundle->id],
                'assigned_to' => 12,
                'endorsed_to' => 21,
                'remarks' => 'For signature',
            ])
            ->assertRedirect('/my-documents')
            ->assertSessionHas('inertia.flash_data.toast.message', 'Document forwarded');

        foreach ([$bundle, $attachment] as $document) {
            $document->refresh();
            $this->assertSame('For Receiving', $document->status);
            $this->assertEquals(12, $document->assigned_to);
            // Fixed in the port: the Livewire picker never saved who it was endorsed to.
            $this->assertEquals(21, $document->endorsed_to);
        }

        $this->assertDatabaseHas('logs', [
            'document_id' => $bundle->id,
            'assigned_to' => 12,
            'remarks' => 'For signature',
            'description' => 'Bundle has been transferred and is to be received by Regulation, Licensing and Enforcement Division',
        ]);
        $this->assertDatabaseHas('logs', [
            'document_id' => $attachment->id,
            'bundle_id' => $bundle->id,
            'description' => 'Bundle (DCB) has been transferred and is to be received by Regulation, Licensing and Enforcement Division.',
        ]);
    }

    public function test_only_this_offices_created_documents_are_forwarded(): void
    {
        $receiving = $this->saveDocument(['control_no' => 'DC1', 'status' => 'For Receiving']);
        $elsewhere = $this->saveDocument(['control_no' => 'DC2', 'office_id' => self::OFFICE + 1]);

        $this->signedIn()
            ->from('/my-documents')
            ->post('/my-documents/forward', ['document_ids' => [$receiving->id, $elsewhere->id], 'assigned_to' => 12])
            ->assertSessionHas('inertia.flash_data.toast.type', 'warning');

        $this->assertNull($receiving->refresh()->assigned_to);
        $this->assertSame('Created', $elsewhere->refresh()->status);
    }

    public function test_forwarding_validates_the_office_and_the_person(): void
    {
        $this->signedIn()
            ->from('/my-documents')
            ->post('/my-documents/forward', [
                'document_ids' => [1],
                'assigned_to' => 999,
                // Works in the sender's office, not the destination.
                'endorsed_to' => 7,
            ])
            ->assertSessionHasErrors(['assigned_to', 'endorsed_to']);

        $this->signedIn()
            ->post('/my-documents/forward', ['assigned_to' => 12])
            ->assertSessionHasErrors('document_ids');
    }

    /** A document of the test office, inside a transaction rolled back after the test. */
    protected function saveDocument(array $overrides = []): Document
    {
        if (! $this->inTransaction) {
            DB::beginTransaction();
            $this->inTransaction = true;
        }

        return Document::create([
            'control_no' => 'DC3720261001093000',
            'source' => 'internal',
            'category_id' => null,
            'subject' => 'Memorandum on the regional assembly',
            'user_id' => 7,
            'office_id' => self::OFFICE,
            'is_arta' => false,
            'is_bundle' => false,
            'citizen_charter_id' => null,
            'status' => 'Created',
            ...$overrides,
        ]);
    }
}
