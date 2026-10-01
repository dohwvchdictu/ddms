<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'inertia';

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'app' => [
                'name' => config('app.name'),
            ],
            'auth' => [
                'user' => fn () => $this->user(),
            ],
            'flash' => [
                'error' => fn () => $request->session()->get('error'),
                'status' => fn () => $request->session()->get('status'),
            ],
        ];
    }

    /**
     * The signed-in employee, trimmed to what the UI shows. The API token and
     * the rest of the employee record stay on the server.
     *
     * @return array<string, mixed>|null
     */
    protected function user(): ?array
    {
        $user = session('user');

        if (!session('jwt_token') || !is_array($user)) {
            return null;
        }

        return [
            'name' => trim(($user['firstName'] ?? '') . ' ' . ($user['lastName'] ?? '') . ' ' . ($user['suffix'] ?? '')),
            'office' => isset($user['office']) ? [
                'id' => $user['office']['id'] ?? null,
                'name' => $user['office']['name'] ?? null,
            ] : null,
            'photo' => session('user_photo'),
        ];
    }
}
