<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\Request;

/** Query-string parsing shared by the React list pages (My Documents, Incoming, …). */
trait ReadsListFilters
{
    /**
     * A comma-separated query value as a list, restricted to `$allowed` when given.
     *
     * @param  list<string>|null  $allowed
     * @return list<string>
     */
    protected static function list(Request $request, string $key, ?array $allowed = null): array
    {
        $values = array_values(array_unique(array_filter(array_map('trim', explode(',', (string) $request->query($key, ''))), 'strlen')));

        return $allowed === null ? $values : array_values(array_intersect($values, $allowed));
    }

    /** A `YYYY-MM-DD` date, or null for anything blank or malformed. */
    protected static function date(mixed $value): ?string
    {
        return is_string($value) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) && strtotime($value) !== false
            ? $value
            : null;
    }

    /**
     * The list's date range from the query string. With no dates given at all
     * it is the default range; an explicitly blank date (`from=`) means no bound.
     *
     * @return array{from: string|null, to: string|null}
     */
    protected static function dateRange(Request $request): array
    {
        if (! $request->has('from') && ! $request->has('to')) {
            return static::defaultRange();
        }

        return ['from' => self::date($request->query('from')), 'to' => self::date($request->query('to'))];
    }

    /**
     * Where a list's dates start: the last 30 days, today included (the date
     * picker's "Last 30 days"). Sent to the page as `defaultRange`, so it can
     * tell the default from a picked range. A list may override it.
     *
     * @return array{from: string, to: string}
     */
    protected static function defaultRange(): array
    {
        return ['from' => now()->subDays(29)->toDateString(), 'to' => now()->toDateString()];
    }

    /** @param  array<string, mixed>|null  $employee */
    protected static function employeeName(?array $employee): ?string
    {
        if (! $employee) {
            return null;
        }

        return trim(($employee['firstName'] ?? '') . ' ' . ($employee['lastName'] ?? '') . ' ' . ($employee['suffix'] ?? '')) ?: null;
    }

    /** `-column` → [column, desc]; `column` → [column, asc]. */
    protected static function sortParts(string $sort): array
    {
        return str_starts_with($sort, '-') ? [substr($sort, 1), 'desc'] : [$sort, 'asc'];
    }
}
