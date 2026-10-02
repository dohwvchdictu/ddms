<?php

namespace App\Actions\Auth;

use App\Services\ApiService;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

/**
 * Re-checks the signed-in employee's HRIS password before a sensitive action,
 * against the same API login uses. Only verifies: the session and its token
 * are left as they are.
 */
class ConfirmPassword
{
    /** Wrong tries allowed per minute, per employee, before a short lockout. */
    protected const MAX_ATTEMPTS = 5;

    public function __construct(protected ApiService $api)
    {
    }

    /**
     * @throws ValidationException on a wrong password (or when it can't be checked), on `$field`.
     */
    public function handle(string $password, string $field = 'password'): void
    {
        $email = (string) session('auth_email', '');
        $key = 'confirm-password:' . sha1(strtolower($email));

        if (RateLimiter::tooManyAttempts($key, self::MAX_ATTEMPTS)) {
            throw ValidationException::withMessages([
                $field => 'Too many tries. Wait ' . RateLimiter::availableIn($key) . ' seconds and try again.',
            ]);
        }

        if ($email === '') {
            throw ValidationException::withMessages([$field => 'Sign in again to confirm with your password.']);
        }

        $response = $this->api->login(['email' => $email, 'password' => $password]);

        if (is_array($response) && ($response['success'] ?? false) === true) {
            RateLimiter::clear($key);

            return;
        }

        $error = is_array($response) ? ($response['error'] ?? null) : null;

        // HRIS being down isn't the user's fault: don't count it against them.
        if (in_array($error, ['connection_error', 'server_error', 'rate_limited'], true)) {
            throw ValidationException::withMessages([$field => 'HRIS could not check your password right now. Try again in a moment.']);
        }

        RateLimiter::hit($key, 60);

        throw ValidationException::withMessages([$field => 'That password is not correct.']);
    }
}
