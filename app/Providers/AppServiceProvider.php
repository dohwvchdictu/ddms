<?php

namespace App\Providers;

use App\Http\Middleware\JwtMiddleware;
use App\Support\CurrentEmployee;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;
use Livewire\Livewire;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Livewire component updates are POSTed to /livewire/update, which is
        // not inside the jwt.auth route group — so without this the session
        // checks in JwtMiddleware only ran on full page loads, and an expired
        // or revoked session could keep driving the page until the next
        // navigation. Marking it persistent re-applies it to every Livewire
        // request that originated from a protected route.
        Livewire::addPersistentMiddleware([
            JwtMiddleware::class,
        ]);

        // The Blade copy of the app shell on the Livewire pages reads the same
        // employee and badge counts as the React one (HandleInertiaRequests).
        View::composer('partials.app-header', fn ($view) => $view->with('employee', CurrentEmployee::get()));
        View::composer('partials.app-sidebar', fn ($view) => $view->with('sidebarCounts', CurrentEmployee::sidebarCounts()));
    }
}
