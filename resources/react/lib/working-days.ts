/**
 * Working-day arithmetic for deadline previews. Mirrors the server's
 * DeadlineCounts::dueDate (Carbon's addWeekdays: weekends skipped, holidays not
 * counted), so a preview matches the deadline the document actually gets.
 */

/** A `YYYY-MM-DD` string as a local date, without the UTC shift `new Date(string)` applies. */
export function parseDay(value: string): Date {
    const [year, month, day] = value.slice(0, 10).split('-').map(Number);

    return new Date(year, month - 1, day);
}

/** `days` working days after `from`. */
export function addWorkingDays(from: Date, days: number): Date {
    const date = new Date(from);
    let remaining = days;

    while (remaining > 0) {
        date.setDate(date.getDate() + 1);

        if (date.getDay() !== 0 && date.getDay() !== 6) {
            remaining--;
        }
    }

    return date;
}

/**
 * The prescribed timeline in working days: the charter's when set, else the
 * category's, else the default. A non-positive value counts as unset, as on
 * the server (Document::requiredDays).
 */
export function requiredDays(charterDays: number | null | undefined, categoryDays: number | null | undefined, fallback: number): number {
    if (charterDays && charterDays > 0) {
        return charterDays;
    }

    if (categoryDays && categoryDays > 0) {
        return categoryDays;
    }

    return fallback;
}

export const longDate = new Intl.DateTimeFormat('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
