<?php

namespace App\Http\Middleware;

use App\Support\Administration;
use App\Support\CurrentEmployee;
use Illuminate\Http\Request;
use Inertia\Inertia;
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
                // Shows the Administration group in the sidebar.
                'canAdminister' => fn () => Administration::allows(session('user')),
            ],
            // Always: lists reload only their own props after an action, and a
            // session message must still come through with them.
            'flash' => Inertia::always([
                'error' => $request->session()->get('error'),
                'status' => $request->session()->get('status'),
            ]),
            'sidebarCounts' => fn () => CurrentEmployee::sidebarCounts(),
        ];
    }
}
