<?php

namespace App\Providers;

use App\Support\Administration;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

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
        // The Administration pages. Sign-in is by HRIS session, not a Laravel
        // user, so the gate is defined for guests too and reads the session.
        Gate::define('administer', fn ($user = null) => Administration::allows(session('user')));
    }
}
