<?php

namespace Tests\Feature;

use App\Actions\Dashboard\DeadlineCounts;
use App\Actions\Navigation\SidebarCounts;
use Inertia\Testing\AssertableInertia as Assert;
use Mockery\MockInterface;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    protected const COUNTS = [
        'for_action' => 4,
        'pending' => 9,
        'due_soon' => 2,
        'due_today' => 1,
        'overdue' => 5,
        'on_track' => 5,
        'total' => 13,
    ];

    protected function setUp(): void
    {
        parent::setUp();

        // Keep the tests off the database: both queries are covered by the
        // rules they encode, not by what happens to be in the dev data.
        $this->mock(DeadlineCounts::class, fn (MockInterface $mock) => $mock->shouldReceive('handle')->andReturn(self::COUNTS));
        $this->mock(SidebarCounts::class, fn (MockInterface $mock) => $mock->shouldReceive('handle')->andReturn([
            'incoming' => 3,
            'pending' => 1,
            'endorsed' => 0,
            'total' => 4,
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
            'user_photo' => '/storage/photos/7-juan.jpg',
            'token_created_at' => time(),
            'revalidated_at' => time(),
        ]);
    }

    public function test_guests_are_sent_to_the_login_page(): void
    {
        $this->get('/dashboard')->assertRedirect(route('login'));
    }

    public function test_dashboard_renders_the_react_page_with_the_counts(): void
    {
        $this->signedIn()
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard')
                ->where('counts.for_action', 4)
                ->where('counts.pending', 9)
                ->where('counts.due_soon', 2)
                ->where('counts.due_today', 1)
                ->where('counts.overdue', 5));
    }

    public function test_layout_props_carry_the_greeting_office_and_badges(): void
    {
        $this->signedIn()
            ->get('/dashboard')
            ->assertInertia(fn (Assert $page) => $page
                ->where('auth.user.firstName', 'Juan')
                ->where('auth.user.name', 'Juan Dela Cruz')
                ->where('auth.user.office.name', 'Knowledge Management and ICT Unit')
                ->where('auth.user.photo', '/storage/photos/7-juan.jpg')
                ->where('sidebarCounts.incoming', 3)
                ->where('sidebarCounts.total', 4)
                ->missing('auth.user.token'));
    }
}
