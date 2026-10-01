<?php

namespace Tests\Feature;

use App\Actions\Dashboard\DeadlineCounts;
use App\Actions\Navigation\SidebarCounts;
use App\Models\Document;
use App\Services\ApiService;
use Inertia\Testing\AssertableInertia as Assert;
use Mockery\MockInterface;
use Tests\TestCase;

class DashboardDocumentsTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->mock(SidebarCounts::class, fn (MockInterface $mock) => $mock->shouldReceive('handle')->andReturn([
            'incoming' => 0, 'pending' => 0, 'endorsed' => 0, 'total' => 0,
        ]));
        $this->mock(ApiService::class, fn (MockInterface $mock) => $mock->shouldReceive('getOfficesData')->andReturn(['officeList' => []]));
    }

    protected function signedIn(): self
    {
        return $this->withSession([
            'jwt_token' => 'token',
            'user' => ['id' => 7, 'firstName' => 'Juan', 'office' => ['id' => 3]],
            'token_created_at' => time(),
            'revalidated_at' => time(),
        ]);
    }

    /** The list's query, stubbed to match nothing; the bucketing itself is DeadlineCounts' job. */
    protected function expectFilter(string $filter): void
    {
        $this->mock(DeadlineCounts::class, function (MockInterface $mock) use ($filter) {
            $mock->shouldReceive('documentsQuery')->once()->with($filter)->andReturn(Document::query()->whereRaw('1 = 0'));
            $mock->shouldReceive('handle')->andReturn([
                'for_action' => 1, 'pending' => 2, 'due_soon' => 3, 'due_today' => 4, 'overdue' => 5, 'on_track' => 0, 'total' => 3,
            ]);
        });
    }

    public function test_guests_are_sent_to_the_login_page(): void
    {
        $this->get('/dashboard/documents?filter=overdue')->assertRedirect(route('login'));
    }

    public function test_the_list_renders_for_a_card(): void
    {
        $this->expectFilter('due_today');

        $this->signedIn()
            ->get('/dashboard/documents?filter=due_today&search=memo')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard/documents')
                ->where('filter', 'due_today')
                ->where('search', 'memo')
                ->where('documents.total', 0)
                ->where('counts.due_today', 4));
    }

    public function test_an_unknown_filter_falls_back_to_overdue(): void
    {
        $this->expectFilter('overdue');

        $this->signedIn()
            ->get('/dashboard/documents?filter=everything')
            ->assertInertia(fn (Assert $page) => $page->where('filter', 'overdue'));
    }
}
