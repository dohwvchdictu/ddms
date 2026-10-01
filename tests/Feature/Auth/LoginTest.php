<?php

namespace Tests\Feature\Auth;

use App\Services\ApiService;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Testing\AssertableInertia as Assert;
use Mockery\MockInterface;
use Tests\TestCase;

class LoginTest extends TestCase
{
    protected const EMAIL = 'juan@dohwv.com';

    protected function inertiaHeaders(): array
    {
        return ['X-Inertia' => 'true', 'X-Requested-With' => 'XMLHttpRequest'];
    }

    protected function employee(): array
    {
        return ['id' => 7, 'firstName' => 'Juan', 'lastName' => 'Dela Cruz', 'suffix' => '', 'office' => ['id' => 3, 'name' => 'ICTU']];
    }

    protected function apiReturns(?array $response): void
    {
        $this->mock(ApiService::class, function (MockInterface $mock) use ($response) {
            $mock->shouldReceive('login')->andReturn($response);
        });
    }

    protected function throttleKey(): string
    {
        return 'login|' . sha1(self::EMAIL) . '|127.0.0.1';
    }

    protected function login(string $password = 'secret123')
    {
        return $this->withHeaders($this->inertiaHeaders())
            ->post('/login', ['email' => self::EMAIL, 'password' => $password]);
    }

    public function test_login_page_renders_the_react_page(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('auth/login')
                ->where('auth.user', null)
                ->has('app.name'));
    }

    public function test_login_page_shows_flashed_errors(): void
    {
        $this->withSession(['error' => 'Your session has expired.'])
            ->get('/')
            ->assertInertia(fn (Assert $page) => $page->where('flash.error', 'Your session has expired.'));
    }

    public function test_signed_in_user_skips_the_login_page(): void
    {
        $this->withSession(['jwt_token' => 'token', 'user' => $this->employee()])
            ->get('/')
            ->assertRedirect(route('dashboard'));
    }

    public function test_valid_credentials_start_a_session_and_leave_inertia_for_the_dashboard(): void
    {
        $this->apiReturns(['success' => true, 'data' => ['token' => 'jwt-abc', 'employee' => $this->employee()]]);

        $this->login()
            ->assertStatus(409)
            ->assertHeader('X-Inertia-Location', route('dashboard'));

        $this->assertSame('jwt-abc', session('jwt_token'));
        $this->assertSame(3, session('user')['office']['id']);
        $this->assertSame(self::EMAIL, session('auth_email'));
        $this->assertNotNull(session('token_created_at'));
        $this->assertNotNull(session('revalidated_at'));
    }

    public function test_valid_credentials_return_to_the_intended_url(): void
    {
        $this->apiReturns(['success' => true, 'data' => ['token' => 'jwt-abc', 'employee' => $this->employee()]]);

        $this->withSession(['url.intended' => url('/my-documents?status=open')])
            ->login()
            ->assertHeader('X-Inertia-Location', url('/my-documents?status=open'));
    }

    public function test_invalid_credentials_show_an_error_and_count_towards_the_throttle(): void
    {
        $this->apiReturns(['success' => false, 'error' => 'invalid_credentials']);

        $this->from('/')->login('wrong-password')
            ->assertRedirect('/')
            ->assertSessionHasErrors(['email' => 'The provided credentials do not match our records. Please check your email and password.']);

        $this->assertNull(session('jwt_token'));
        $this->assertSame(1, RateLimiter::attempts($this->throttleKey()));
    }

    public function test_api_message_is_shown_verbatim(): void
    {
        $this->apiReturns(['success' => false, 'error' => 'invalid_credentials', 'api_message' => 'Your account is locked.']);

        $this->from('/')->login()->assertSessionHasErrors(['email' => 'Your account is locked.']);
    }

    public function test_an_unreachable_api_does_not_count_towards_the_throttle(): void
    {
        $this->apiReturns(['success' => false, 'error' => 'connection_error']);

        $this->from('/')->login()->assertSessionHasErrors('email');

        $this->assertSame(0, RateLimiter::attempts($this->throttleKey()));
    }

    public function test_too_many_failures_are_throttled_before_calling_the_api(): void
    {
        config(['session.login_max_attempts' => 2]);
        RateLimiter::hit($this->throttleKey(), 60);
        RateLimiter::hit($this->throttleKey(), 60);

        $this->mock(ApiService::class, fn (MockInterface $mock) => $mock->shouldNotReceive('login'));

        $this->from('/')->login()->assertSessionHasErrors('email');

        $this->assertStringStartsWith('Too many failed sign-in attempts.', session('errors')->first('email'));
    }

    public function test_input_is_validated(): void
    {
        $this->mock(ApiService::class, fn (MockInterface $mock) => $mock->shouldNotReceive('login'));

        $this->from('/')
            ->withHeaders($this->inertiaHeaders())
            ->post('/login', ['email' => 'not-an-email', 'password' => '123'])
            ->assertSessionHasErrors(['email', 'password']);
    }

    public function test_protected_pages_send_guests_to_the_login_page(): void
    {
        $this->get('/my-documents')->assertRedirect(route('login'));

        $this->assertSame(url('/my-documents'), session('url.intended'));
    }
}
