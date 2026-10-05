<?php

namespace App\Support;

/**
 * Who may use the Administration pages: everyone in an office listed in
 * ADMIN_OFFICE_IDS (ICTU by default). One place, so user roles can replace
 * this later without touching the routes, pages or sidebar.
 */
class Administration
{
    /** @param  array<string, mixed>|null  $user  The session employee. */
    public static function allows(?array $user): bool
    {
        // The session office follows HRIS transfers (JwtMiddleware revalidates it).
        $office = $user['office']['id'] ?? null;

        return $office !== null && in_array((string) $office, array_map('strval', config('ddms.admin_office_ids', [])), true);
    }
}
