<?php

namespace App\Http\Controllers\Auth;

use App\Actions\Auth\AuthenticateEmployee;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class LoginController extends Controller
{
    public function show(): Response|SymfonyResponse
    {
        $user = session('user');

        // Identity lives in the Laravel session (SESSION_LIFETIME), not the
        // 5-minute API token, so an existing session is enough to skip the
        // login page — no token refresh needed.
        if (session('jwt_token') && isset($user['office']['id'])) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('auth/login');
    }

    public function store(LoginRequest $request, AuthenticateEmployee $authenticate): SymfonyResponse
    {
        $authenticate->handle(
            $request->string('email')->toString(),
            $request->string('password')->toString(),
            $request->ip(),
        );

        // A full page load, not an Inertia visit: the dashboard is still a
        // Livewire page.
        return Inertia::location(session()->pull('url.intended', route('dashboard')));
    }
}
