<?php

namespace App\Support;

use App\Actions\Navigation\SidebarCounts;

/**
 * The signed-in employee, trimmed to what the app shell shows. The API token
 * and the rest of the employee record stay on the server. Shared with React
 * through HandleInertiaRequests.
 */
class CurrentEmployee
{
    /** Shown when an employee has no cached photo yet. */
    public const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80';

    /**
     * @return array{firstName: string, name: string, office: array{id: mixed, name: mixed}|null, photo: string}|null
     */
    public static function get(): ?array
    {
        $user = session('user');

        if (! session('jwt_token') || ! is_array($user)) {
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
     * Badge counts for the sidebar's Inbox menu, for the signed-in office.
     *
     * @return array{incoming: int, pending: int, endorsed: int, total: int}|null
     */
    public static function sidebarCounts(): ?array
    {
        $user = session('user');

        if (! session('jwt_token') || ! isset($user['office']['id'])) {
            return null;
        }

        return app(SidebarCounts::class)->handle($user['office']['id'], $user['id'] ?? null);
    }
}
