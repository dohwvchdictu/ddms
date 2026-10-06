<?php

namespace App\Http\Controllers;

use App\Actions\Dashboard\DailyActivity;
use App\Actions\Dashboard\DeadlineCounts;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /** Days of history in the new-vs-closed chart. */
    public const ACTIVITY_DAYS = 30;

    public function __invoke(DeadlineCounts $deadlineCounts, DailyActivity $dailyActivity): Response
    {
        if (!isset(session('user')['office']['id'])) {
            session()->now('error', 'User office information not found. Please login again.');
        }

        return Inertia::render('dashboard', [
            // Deferred: the page opens with skeletons and the figures follow.
            // Rescued: a failure offers a retry.
            'counts' => Inertia::defer(fn () => $deadlineCounts->handle(), rescue: true),
            'activity' => Inertia::defer(fn () => $dailyActivity->handle(self::ACTIVITY_DAYS), rescue: true),
        ]);
    }
}
