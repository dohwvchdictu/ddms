<?php

namespace Tests\Feature\Auth;

use App\Actions\Navigation\SidebarCounts;
use Mockery\MockInterface;
use Tests\TestCase;

/**
 * What a signed-out visitor gets: a page load goes to the login page, a
 * background JSON request gets a 401 (lib/fetch-json.ts then opens the login
 * page), and an Inertia visit is still redirected.
 */
class SignedOutTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->mock(SidebarCounts::class, fn (MockInterface $mock) => $mock->shouldReceive('handle')->andReturn([
            'incoming' => 0, 'pending' => 0, 'endorsed' => 0, 'total' => 0,
        ]));
    }

    public function test_a_page_load_is_sent_to_the_login_page_and_comes_back_after(): void
    {
        $this->get('/status-pending?endorsed=me')
            ->assertRedirect(route('login'))
            ->assertSessionHas('url.intended', url('/status-pending?endorsed=me'));
    }

    public function test_a_background_request_gets_a_401_and_returns_to_its_page_after_signing_in(): void
    {
        $this->getJson('/documents/search?q=memo', ['Referer' => url('/my-documents')])
            ->assertUnauthorized()
            ->assertJsonPath('message', 'Your session has ended. Please sign in again.')
            // Not the JSON address: the page the request came from.
            ->assertSessionHas('url.intended', url('/my-documents'));
    }

    public function test_an_inertia_visit_is_still_redirected(): void
    {
        $this->get('/status-incoming', ['X-Inertia' => 'true', 'Accept' => 'application/json', 'X-Requested-With' => 'XMLHttpRequest'])
            ->assertRedirect(route('login'));
    }

    public function test_an_expired_session_ends_with_a_401_for_a_background_request(): void
    {
        config(['session.absolute_lifetime' => 60]);

        $this->withSession([
            'jwt_token' => 'token',
            'user' => ['id' => 7, 'firstName' => 'Juan', 'lastName' => 'Dela Cruz', 'suffix' => '', 'office' => ['id' => 990001]],
            'token_created_at' => time() - 2 * 3600,
            'revalidated_at' => time(),
        ])
            ->getJson('/documents/1/tracking')
            ->assertUnauthorized()
            // Shown on the login page the browser is sent to.
            ->assertSessionHas('error', 'Your session has expired. Please sign in again.');
    }
}
