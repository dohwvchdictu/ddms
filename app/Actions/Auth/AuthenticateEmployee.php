<?php

namespace App\Actions\Auth;

use App\Services\ApiService;
use App\Support\EmployeePhoto;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

/**
 * Signs an employee in against the central auth API and starts their
 * session. Any failure is thrown as a validation error on `email`, which is
 * where the login form shows it.
 */
class AuthenticateEmployee
{
    public function __construct(protected ApiService $apiService)
    {
    }

    /**
     * @throws ValidationException
     */
    public function handle(string $email, string $password, string $ip): void
    {
        $throttleKey = $this->throttleKey($email, $ip);

        // Throttle before the request leaves this server. Every user's login
        // is proxied from one IP, so without this one person's repeated bad
        // password trips the API's per-IP limit and locks out everybody.
        $this->ensureIsNotThrottled($throttleKey, $email, $ip);

        $response = $this->apiService->login([
            'email' => $email,
            'password' => $password,
        ]);

        // Check if the response is valid
        if (!$response || !is_array($response)) {
            RateLimiter::hit($throttleKey, $this->decaySeconds());
            $this->fail('An unexpected error occurred. Please try again.');
        }

        if (isset($response['success']) && $response['success'] === true) {
            RateLimiter::clear($throttleKey);
            $this->startSession($response['data'], $email);

            return;
        }

        // Count rejected credentials, but not the API being unreachable —
        // nobody should be locked out of retrying because of an outage.
        if (!in_array($response['error'] ?? null, ['connection_error', 'server_error', 'rate_limited'], true)) {
            RateLimiter::hit($throttleKey, $this->decaySeconds());
        }

        $this->fail($this->errorMessage($response));
    }

    protected function startSession(array $data, string $email): void
    {
        // Issue a fresh session id now that this session is becoming
        // privileged, so a session id fixed before login cannot be reused
        // afterwards. Existing session data (including url.intended) is
        // carried over to the new id.
        session()->regenerate();

        session([
            'jwt_token' => $data['token'],
            'user' => $data['employee'],
            'auth_email' => $email,
            'token_created_at' => time(),
            'revalidated_at' => time(),
        ]);

        // If this employee's photo was cached by an earlier login it can
        // be resolved right away, at no cost.
        if ($cached = EmployeePhoto::cachedUrl($data['employee'])) {
            session(['user_photo' => $cached]);
        }

        // Otherwise fetch it after the response has been sent. The token
        // is only good for five minutes and is used for nothing else, so
        // it has to happen now — but it must not sit between the user and
        // their dashboard. Runs during the framework's terminate phase, which
        // is *after* the session has been written — so this writes to disk
        // only. The navbar resolves the file from disk on the next request.
        $employee = $data['employee'];
        $token = $data['token'];

        app()->terminating(function () use ($employee, $token) {
            EmployeePhoto::cache($employee, $token);
        });
    }

    /**
     * When the API returned its own message (e.g. "Your account is locked"),
     * show that verbatim; otherwise fall back to friendly, mapped text for
     * transport-level failures that have no useful body.
     */
    protected function errorMessage(array $response): string
    {
        if (!isset($response['error'])) {
            return 'Authentication failed. Please verify your credentials and try again.';
        }

        if (!empty($response['api_message'])) {
            return $response['api_message'];
        }

        return match ($response['error']) {
            'connection_error' => 'Unable to connect to the authentication server. Please check your internet connection and try again.',
            'invalid_credentials' => 'The provided credentials do not match our records. Please check your email and password.',
            'server_error' => 'The authentication server is currently unavailable. Please try again later.',
            'rate_limited' => $response['message'] ?? 'Too many login attempts. Please wait a moment and try again.',
            default => 'An error occurred during authentication. Please try again.',
        };
    }

    /**
     * Cast because env() hands back a string, which RateLimiter::hit() rejects.
     */
    protected function decaySeconds(): int
    {
        return (int) config('session.login_decay_seconds', 60);
    }

    /**
     * Rate-limiter key for this attempt. Scoped to the email *and* the client
     * IP so that one workstation hammering an account cannot lock that account
     * out from everywhere else, and one person cannot exhaust the budget for
     * the whole office.
     */
    protected function throttleKey(string $email, string $ip): string
    {
        return 'login|' . sha1(mb_strtolower(trim($email))) . '|' . $ip;
    }

    /**
     * @throws ValidationException
     */
    protected function ensureIsNotThrottled(string $throttleKey, string $email, string $ip): void
    {
        $maxAttempts = (int) config('session.login_max_attempts', 5);

        if ($maxAttempts <= 0 || !RateLimiter::tooManyAttempts($throttleKey, $maxAttempts)) {
            return;
        }

        $seconds = RateLimiter::availableIn($throttleKey);

        Log::warning('Login throttled locally', [
            'email' => $email,
            'ip' => $ip,
            'available_in' => $seconds,
        ]);

        $this->fail('Too many failed sign-in attempts. Please wait '
            . ($seconds > 60 ? ceil($seconds / 60) . ' minute(s)' : $seconds . ' second(s)')
            . ' and try again.');
    }

    /**
     * @throws ValidationException
     */
    protected function fail(string $message): never
    {
        throw ValidationException::withMessages(['email' => $message]);
    }
}
