<?php

namespace Tests\Feature\Admin;

use App\Actions\Navigation\SidebarCounts;
use App\Models\Category;
use App\Models\CitizenCharter;
use App\Services\ApiService;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Mockery\MockInterface;
use Tests\TestCase;

/** Administration: categories, citizen's charter, actions, for the offices in ADMIN_OFFICE_IDS (ICTU). */
class AdministrationTest extends TestCase
{
    /** Stands in for ICTU: its staff may administer. */
    protected const OFFICE = 990001;

    /** Any other office. */
    protected const OTHER_OFFICE = 990002;

    protected bool $inTransaction = false;

    protected function setUp(): void
    {
        parent::setUp();

        config(['ddms.admin_office_ids' => [(string) self::OFFICE]]);

        $this->mock(SidebarCounts::class, fn (MockInterface $mock) => $mock->shouldReceive('handle')->andReturn([
            'incoming' => 0, 'pending' => 0, 'endorsed' => 0, 'total' => 0,
        ]));

        $offices = [['id' => self::OFFICE, 'officeCode' => 'KMICT', 'officeName' => 'Knowledge Management and ICT Unit']];

        $this->mock(ApiService::class, function (MockInterface $mock) use ($offices) {
            $mock->shouldReceive('getOfficesData')->andReturn(['officeList' => $offices]);
            $mock->shouldReceive('getActiveOffices')->andReturn($offices);
            $mock->shouldReceive('getEmployeesData')->andReturn(['employeesList' => []]);
        });

        // Rows written here are rolled back in tearDown: the dev database is shared.
        DB::beginTransaction();
        $this->inTransaction = true;
    }

    protected function tearDown(): void
    {
        if ($this->inTransaction) {
            DB::rollBack();
        }

        parent::tearDown();
    }

    protected function signedIn(int $office = self::OFFICE): self
    {
        return $this->withSession([
            'jwt_token' => 'token',
            'user' => ['id' => 7, 'firstName' => 'Juan', 'lastName' => 'Dela Cruz', 'suffix' => '', 'office' => ['id' => $office, 'officeName' => 'Some office']],
            'token_created_at' => time(),
            'revalidated_at' => time(),
        ]);
    }

    public function test_only_staff_of_the_admin_offices_get_in(): void
    {
        $urls = ['/admin/categories', '/admin/citizen-charters', '/admin/actions'];

        // Guests first: a session set later in the test carries over to the next request.
        foreach ($urls as $url) {
            $this->get($url)->assertRedirect(route('login'));
        }

        foreach ($urls as $url) {
            $this->signedIn(self::OTHER_OFFICE)->get($url)->assertForbidden();
            $this->signedIn()->get($url)->assertOk();
        }

        $this->signedIn(self::OTHER_OFFICE)->post('/admin/categories', ['name' => 'Zz Test', 'required_days' => 3, 'is_active' => true])->assertForbidden();
    }

    public function test_the_sidebar_shows_administration_only_to_them(): void
    {
        $this->signedIn()->get('/admin/actions')->assertInertia(fn (Assert $page) => $page->where('auth.canAdminister', true));
        $this->signedIn(self::OTHER_OFFICE)->get('/dashboard')->assertInertia(fn (Assert $page) => $page->where('auth.canAdminister', false));
    }

    public function test_a_category_is_added_with_a_slug_and_edited_without_losing_it(): void
    {
        $this->signedIn()
            ->post('/admin/categories', ['name' => '  Zz Test Memorandum ', 'required_days' => 5, 'is_active' => true])
            ->assertRedirect()
            ->assertSessionHas('inertia.flash_data.toast.type', 'success');

        $category = Category::where('name', 'Zz Test Memorandum')->firstOrFail();
        $this->assertSame('zz-test-memorandum', $category->slug);

        $this->signedIn()
            ->patch("/admin/categories/{$category->id}", ['name' => 'Zz Test Memo (renamed)', 'required_days' => 7, 'is_active' => false])
            ->assertRedirect();

        $category->refresh();
        $this->assertSame('zz-test-memorandum', $category->slug);
        $this->assertSame(7, $category->required_days);
        $this->assertFalse((bool) $category->is_active);

        // A second category with the same slug base gets a numbered slug.
        $this->signedIn()->post('/admin/categories', ['name' => 'Zz Test Memorandum', 'required_days' => 3, 'is_active' => true]);
        $this->assertSame('zz-test-memorandum-2', Category::where('name', 'Zz Test Memorandum')->value('slug'));
    }

    public function test_a_category_must_be_valid_and_unique(): void
    {
        $existing = Category::create(['name' => 'Zz Test Existing', 'slug' => 'zz-test-existing', 'required_days' => 3, 'is_active' => true]);

        $this->signedIn()
            ->post('/admin/categories', ['name' => 'Zz Test Existing', 'required_days' => 0, 'is_active' => true])
            ->assertSessionHasErrors(['name', 'required_days']);

        // Saving it under its own name is fine.
        $this->signedIn()
            ->patch("/admin/categories/{$existing->id}", ['name' => 'Zz Test Existing', 'required_days' => 4, 'is_active' => true])
            ->assertSessionHasNoErrors();
    }

    public function test_the_category_list_filters_and_counts(): void
    {
        Category::create(['name' => 'Zz Test Active', 'slug' => 'zz-test-active', 'required_days' => 3, 'is_active' => true]);
        Category::create(['name' => 'Zz Test Inactive', 'slug' => 'zz-test-inactive', 'required_days' => 3, 'is_active' => false]);

        $this->signedIn()
            ->get('/admin/categories?search=Zz Test&status=inactive')
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/categories')
                ->where('counts', ['all' => 2, 'active' => 1, 'inactive' => 1])
                ->where('categories.total', 1)
                ->where('categories.data.0.name', 'Zz Test Inactive'));
    }

    public function test_a_charter_needs_an_active_office_and_a_name_unique_within_it(): void
    {
        $this->signedIn()
            ->post('/admin/citizen-charters', ['name' => 'Zz Test Process', 'office_id' => 123456789, 'required_days' => 7, 'is_external' => true, 'is_active' => true])
            ->assertSessionHasErrors('office_id');

        $this->signedIn()
            ->post('/admin/citizen-charters', ['name' => 'Zz Test Process', 'office_id' => self::OFFICE, 'required_days' => 7, 'is_external' => true, 'is_active' => true])
            ->assertSessionHasNoErrors();

        $charter = CitizenCharter::where('name', 'Zz Test Process')->firstOrFail();
        $this->assertSame(self::OFFICE, (int) $charter->office_id);

        $this->signedIn()
            ->post('/admin/citizen-charters', ['name' => 'Zz Test Process', 'office_id' => self::OFFICE, 'required_days' => 7, 'is_external' => true, 'is_active' => true])
            ->assertSessionHasErrors('name');

        $this->signedIn()
            ->patch("/admin/citizen-charters/{$charter->id}", ['name' => 'Zz Test Process', 'office_id' => self::OFFICE, 'required_days' => 10, 'is_external' => false, 'is_active' => false])
            ->assertSessionHasNoErrors();

        $charter->refresh();
        $this->assertSame(10, $charter->required_days);
        $this->assertFalse((bool) $charter->is_active);

        $this->signedIn()
            ->get('/admin/citizen-charters?search=Zz Test')
            ->assertInertia(fn (Assert $page) => $page
                ->where('charters.data.0.office', 'Knowledge Management and ICT Unit')
                ->has('offices', 1));
    }

    public function test_workflow_steps_are_listed_and_cannot_be_changed(): void
    {
        $this->signedIn()
            ->get('/admin/actions')
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/actions')
                ->where('actions', fn ($actions) => collect($actions)->pluck('name')->contains('Forwarded')));

        // Existing ones can't be changed: there is no edit or delete route.
        $forwarded = \App\Models\Action::where('name', 'Forwarded')->value('id');
        $this->signedIn()->patch("/admin/actions/{$forwarded}", ['name' => 'x'])->assertNotFound();
        $this->signedIn()->delete("/admin/actions/{$forwarded}")->assertNotFound();
    }

    public function test_an_action_can_be_added_with_a_colour_from_the_palette(): void
    {
        $this->signedIn()
            ->post('/admin/actions', ['name' => 'Forwarded', 'color' => 'bg-purple-900'])
            ->assertSessionHasErrors(['name', 'color']);

        $this->signedIn()
            ->post('/admin/actions', ['name' => '  Zz Test Reviewed ', 'color' => 'bg-sky-100'])
            ->assertSessionHasNoErrors()
            ->assertSessionHas('inertia.flash_data.toast.type', 'success');

        $this->assertDatabaseHas('actions', ['name' => 'Zz Test Reviewed', 'color' => 'bg-sky-100']);

        $this->signedIn(self::OTHER_OFFICE)->post('/admin/actions', ['name' => 'Zz Test Other', 'color' => 'bg-sky-100'])->assertForbidden();
    }
}
