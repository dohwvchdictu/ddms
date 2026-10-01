<?php

namespace App\Http\Middleware;

use App\Support\CurrentEmployee;
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
                'user' => fn () => CurrentEmployee::get(),
            ],
            'flash' => [
                'error' => fn () => $request->session()->get('error'),
                'status' => fn () => $request->session()->get('status'),
                'legacy' => fn () => $this->legacyAlert(),
            ],
            'sidebarCounts' => fn () => CurrentEmployee::sidebarCounts(),
        ];
    }

    /**
     * A SweetAlert queued by a Livewire page (App\Traits\LivewireAlert::flash)
     * before redirecting to a React page, reshaped as a toast. Needed only while
     * the migration lasts: Livewire actions still land on React lists.
     *
     * @return array{type: string, message: string}|null
     */
    protected function legacyAlert(): ?array
    {
        $alert = session('livewire-alert');

        if (! is_array($alert) || blank($alert['titleText'] ?? null)) {
            return null;
        }

        return [
            'type' => in_array($alert['icon'] ?? null, ['success', 'error', 'warning', 'info'], true) ? $alert['icon'] : 'info',
            'message' => $alert['titleText'],
        ];
    }
}
