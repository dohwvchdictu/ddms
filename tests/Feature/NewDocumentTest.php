<?php

namespace Tests\Feature;

use App\Actions\Documents\CreateDocument;
use App\Actions\Documents\RecentCategories;
use App\Actions\Navigation\SidebarCounts;
use App\Models\Category;
use App\Models\Document;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Mockery\MockInterface;
use Tests\TestCase;

class NewDocumentTest extends TestCase
{
    /** Set by the tests that write (unsavedCharterDocument); rolled back in tearDown. */
    protected bool $inTransaction = false;

    protected function tearDown(): void
    {
        if ($this->inTransaction) {
            DB::rollBack();
        }

        parent::tearDown();
    }

    protected function setUp(): void
    {
        parent::setUp();

        $this->mock(SidebarCounts::class, fn (MockInterface $mock) => $mock->shouldReceive('handle')->andReturn([
            'incoming' => 0, 'pending' => 0, 'endorsed' => 0, 'total' => 0,
        ]));
    }

    protected function signedIn(): self
    {
        return $this->withSession([
            'jwt_token' => 'token',
            'user' => [
                'id' => 7,
                'firstName' => 'Juan',
                'lastName' => 'Dela Cruz',
                'suffix' => '',
                'office' => ['id' => 3, 'officeName' => 'Knowledge Management and ICT Unit'],
            ],
            'token_created_at' => time(),
            'revalidated_at' => time(),
        ]);
    }

    public function test_guests_are_sent_to_the_login_page(): void
    {
        $this->get('/new-document')->assertRedirect(route('login'));
        $this->post('/new-document')->assertRedirect(route('login'));
    }

    public function test_the_form_renders_with_its_options(): void
    {
        $this->mock(RecentCategories::class, fn (MockInterface $mock) => $mock->shouldReceive('handle')->with(7)->andReturn([4, 2]));

        $this->signedIn()
            ->get('/new-document')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('documents/create')
                ->where('controlNo', fn (string $no) => preg_match('/^DC37\d{14}$/', $no) === 1)
                ->where('today', now()->toDateString())
                ->where('defaultRequiredDays', Document::DEFAULT_REQUIRED_DAYS)
                ->where('recentCategoryIds', [4, 2])
                ->has('categories')
                ->has('charters'));
    }

    /**
     * The regression behind "blank save shows no errors": the redirect back
     * after a failed save must show the same number, or the form (which follows
     * it) resets and the errors vanish with what was typed.
     */
    public function test_the_control_number_survives_a_failed_save(): void
    {
        $this->mock(RecentCategories::class, fn (MockInterface $mock) => $mock->shouldReceive('handle')->andReturn([]));
        Carbon::setTestNow('2026-10-01 09:30:00');

        $issued = null;
        $this->signedIn()
            ->get('/new-document')
            ->assertInertia(function (Assert $page) use (&$issued) {
                $issued = $page->toArray()['props']['controlNo'];
            });

        Carbon::setTestNow('2026-10-01 09:30:07');

        $this->from('/new-document')
            ->followingRedirects()
            ->post('/new-document', ['control_no' => $issued, 'is_arta' => false, 'is_bundle' => false])
            ->assertInertia(fn (Assert $page) => $page
                ->where('controlNo', $issued)
                ->has('errors.source')
                ->has('errors.category_id')
                ->has('errors.subject'));
    }

    public function test_a_number_from_another_day_is_reissued(): void
    {
        $this->mock(RecentCategories::class, fn (MockInterface $mock) => $mock->shouldReceive('handle')->andReturn([]));
        Carbon::setTestNow('2026-10-02 08:00:00');

        $this->signedIn()
            ->withSession([CreateDocument::PENDING_KEY => 'DC3720261001093000'])
            ->get('/new-document')
            ->assertInertia(fn (Assert $page) => $page->where('controlNo', 'DC3720261002080000'));
    }

    public function test_a_regular_document_needs_source_category_and_subject(): void
    {
        $this->mock(CreateDocument::class, fn (MockInterface $mock) => $mock->shouldNotReceive('handle'));

        $this->signedIn()
            ->from('/new-document')
            ->post('/new-document', ['is_arta' => false, 'is_bundle' => false, 'subject' => 'short'])
            ->assertRedirect('/new-document')
            ->assertSessionHasErrors(['control_no', 'source', 'category_id', 'subject'])
            ->assertSessionDoesntHaveErrors('citizen_charter_id');
    }

    public function test_a_charter_transaction_needs_a_procedure_instead_of_a_category(): void
    {
        $this->mock(CreateDocument::class, fn (MockInterface $mock) => $mock->shouldNotReceive('handle'));

        $this->signedIn()
            ->from('/new-document')
            ->post('/new-document', ['source' => 'external', 'is_arta' => true, 'is_bundle' => false, 'subject' => 'Request for a certificate'])
            ->assertSessionHasErrors('citizen_charter_id')
            ->assertSessionDoesntHaveErrors('category_id');
    }

    public function test_the_source_must_be_internal_or_external(): void
    {
        $this->signedIn()
            ->post('/new-document', ['source' => 'elsewhere', 'is_arta' => false, 'is_bundle' => false])
            ->assertSessionHasErrors('source');
    }

    /** A valid submission, with the save itself mocked to return document #42. */
    protected function validSubmission(array $extra = []): array
    {
        $categoryId = Category::query()->value('id');

        if ($categoryId === null) {
            $this->markTestSkipped('No categories in this database.');
        }

        $saved = new Document(['control_no' => 'DC3720261001093000', 'is_bundle' => false]);
        $saved->id = 42;

        $this->mock(CreateDocument::class, fn (MockInterface $mock) => $mock->shouldReceive('handle')
            ->once()
            ->withArgs(fn (array $data, array $user) => $data['subject'] === 'Memorandum on the regional assembly' && $user['id'] === 7)
            ->andReturn($saved));

        return [
            'control_no' => 'DC3720261001093000',
            'source' => 'internal',
            'is_arta' => false,
            'category_id' => $categoryId,
            'subject' => 'Memorandum on the regional assembly',
            'is_bundle' => false,
            ...$extra,
        ];
    }

    public function test_saving_shows_the_confirmation_page(): void
    {
        $this->signedIn()
            ->withSession([CreateDocument::PENDING_KEY => 'DC3720261001093000'])
            ->post('/new-document', $this->validSubmission())
            ->assertRedirect(route('documents.created', 42))
            // Used up, so the next form is issued a new one.
            ->assertSessionMissing(CreateDocument::PENDING_KEY);
    }

    public function test_save_and_new_returns_to_a_fresh_form_with_a_toast(): void
    {
        $this->signedIn()
            ->post('/new-document', $this->validSubmission(['after' => 'new']))
            ->assertRedirect(route('documents.create'))
            ->assertSessionHas('inertia.flash_data.toast', [
                'type' => 'success',
                'message' => 'Document saved',
                'description' => 'DC3720261001093000',
            ]);
    }

    public function test_the_confirmation_page_shows_the_saved_document(): void
    {
        $document = $this->unsavedCharterDocument(userId: 7);

        $this->signedIn()
            ->get(route('documents.created', $document))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('documents/created')
                ->where('document.control_no', $document->control_no)
                ->where('document.required_days', Document::DEFAULT_REQUIRED_DAYS)
                ->where('listPath', '/my-documents'));
    }

    public function test_the_confirmation_page_is_only_for_whoever_encoded_it(): void
    {
        $document = $this->unsavedCharterDocument(userId: 8);

        $this->signedIn()->get(route('documents.created', $document))->assertNotFound();
    }

    /**
     * A document saved inside the test's transaction, so nothing is left in
     * the (shared dev) database afterwards.
     */
    protected function unsavedCharterDocument(int $userId): Document
    {
        DB::beginTransaction();
        $this->inTransaction = true;

        return Document::create([
            'control_no' => 'DC3' . $userId . '20261001093000',
            'source' => 'external',
            'category_id' => null,
            'subject' => 'Request for a certificate of employment',
            'user_id' => $userId,
            'office_id' => 3,
            'is_arta' => true,
            'is_bundle' => false,
            'citizen_charter_id' => null,
            'status' => 'Created',
        ]);
    }

    public function test_the_control_number_must_be_this_employees_own(): void
    {
        // Office 3, employee 8: someone else's number.
        $this->signedIn()
            ->post('/new-document', ['control_no' => 'DC3820261001093000'])
            ->assertSessionHasErrors('control_no');
    }

    public function test_the_action_saves_a_charter_document_and_logs_it(): void
    {
        DB::beginTransaction();
        $this->inTransaction = true;

        $categoryId = Category::query()->value('id');

        $document = app(CreateDocument::class)->handle([
            'control_no' => 'DC3720261001093001',
            'source' => 'external',
            // Sent by mistake alongside a charter: the category must be dropped.
            'category_id' => $categoryId,
            'citizen_charter_id' => null,
            'subject' => 'Request for a certificate of employment',
            'is_arta' => true,
            'is_bundle' => true,
        ], ['id' => 7, 'office' => ['id' => 3]]);

        $this->assertNull($document->category_id);
        $this->assertSame('Created', $document->status);
        $this->assertDatabaseHas('logs', [
            'document_id' => $document->id,
            'user_id' => 7,
            'office_id' => 3,
            'description' => 'Bundle is created. Preparing to print tracking form.',
        ]);
    }

    public function test_uncategorised_charter_documents_go_to_the_general_list(): void
    {
        $this->assertSame('/my-documents', CreateDocument::listPath(new Document(['category_id' => null])));
    }
}
