<?php

namespace App\Http\Controllers;

use App\Actions\Dashboard\DeadlineCounts;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(DeadlineCounts $deadlineCounts): Response
    {
        if (!isset(session('user')['office']['id'])) {
            session()->now('error', 'User office information not found. Please login again.');
        }

        return Inertia::render('dashboard', [
            'counts' => $deadlineCounts->handle(),
        ]);
    }
}
