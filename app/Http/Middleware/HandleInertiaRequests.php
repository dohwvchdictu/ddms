<?php

namespace App\Http\Middleware;

use App\Actions\Navigation\SidebarCounts;
use App\Support\EmployeePhoto;
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

    /** Shown when an employee has no cached photo yet. */
    protected const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80';

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
            'sidebarCounts' => fn () => $this->sidebarCounts(),
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
            'firstName' => $user['firstName'] ?? '',
            'name' => trim(($user['firstName'] ?? '') . ' ' . ($user['lastName'] ?? '') . ' ' . ($user['suffix'] ?? '')),
            'office' => isset($user['office']) ? [
                'id' => $user['office']['id'] ?? null,
                'name' => $user['office']['officeName'] ?? null,
            ] : null,
            // Cached at login; never fetched here, so it cannot stall a page.
            'photo' => session('user_photo') ?? EmployeePhoto::cachedUrl($user) ?? self::DEFAULT_PHOTO,
        ];
    }

    /**
     * Badge counts for the sidebar's Status menu, for the signed-in office.
     *
     * @return array{incoming: int, pending: int, endorsed: int, total: int}|null
     */
    protected function sidebarCounts(): ?array
    {
        $user = session('user');

        if (!session('jwt_token') || !isset($user['office']['id'])) {
            return null;
        }

        return app(SidebarCounts::class)->handle($user['office']['id'], $user['id'] ?? null);
    }
}
