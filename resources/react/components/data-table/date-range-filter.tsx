import { CalendarRange, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { parseDay } from '@/lib/working-days';

export interface DateRangeValue {
    /** `YYYY-MM-DD`, or null for no bound. */
    from: string | null;
    to: string | null;
}

interface DateRangeFilterProps {
    value: DateRangeValue;
    onChange: (value: DateRangeValue) => void;
    /** What the button is about, for screen readers: "Created", "Received"… */
    label?: string;
}

/** A local date as `YYYY-MM-DD` (not toISOString, which shifts to UTC). */
const ymd = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

/** Common ranges, worked out from today each time the picker opens. */
function presets(): { label: string; range: DateRangeValue }[] {
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return [
        { label: 'Today', range: { from: ymd(today), to: ymd(today) } },
        { label: 'Yesterday', range: { from: ymd(addDays(today, -1)), to: ymd(addDays(today, -1)) } },
        { label: 'Last 7 days', range: { from: ymd(addDays(today, -6)), to: ymd(today) } },
        { label: 'Last 30 days', range: { from: ymd(addDays(today, -29)), to: ymd(today) } },
        // The list's default: the same day last month to today.
        { label: 'Past month', range: { from: ymd(new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())), to: ymd(today) } },
        { label: 'This month', range: { from: ymd(firstOfMonth), to: ymd(today) } },
        { label: 'This year', range: { from: ymd(new Date(today.getFullYear(), 0, 1)), to: ymd(today) } },
        { label: 'Any date', range: { from: null, to: null } },
    ];
}

const short = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric' });
const long = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

/** "Last 7 days", "Sep 1 – Oct 1, 2026", "Since Sep 1, 2026"… */
export function describeRange({ from, to }: DateRangeValue): string {
    const preset = presets().find((item) => item.range.from === from && item.range.to === to);

    if (preset) {
        return preset.label;
    }

    if (from && to) {
        const start = parseDay(from);
        const end = parseDay(to);

        return start.getFullYear() === end.getFullYear()
            ? `${short.format(start)} – ${long.format(end)}`
            : `${long.format(start)} – ${long.format(end)}`;
    }

    if (from) {
        return `Since ${long.format(parseDay(from))}`;
    }

    if (to) {
        return `Until ${long.format(parseDay(to))}`;
    }

    return 'Any date';
}

export const isSameRange = (a: DateRangeValue, b: DateRangeValue) => a.from === b.from && a.to === b.to;

/**
 * A list's dates for its URL. The list's default range (the server's, when no
 * dates are given) is left out; any other range is sent as is, a missing bound
 * as empty, so "Any date" stays any date instead of falling back to the default.
 */
export function rangeQuery(value: DateRangeValue, defaultRange: DateRangeValue): { from?: string; to?: string } {
    return isSameRange(value, defaultRange) ? {} : { from: value.from ?? '', to: value.to ?? '' };
}

/**
 * One button for a date range: presets down the side, a two-month calendar to
 * pick any range, applied when both ends are chosen.
 */
export default function DateRangeFilter({ value, onChange, label = 'Date' }: DateRangeFilterProps) {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState<DateRange | undefined>();
    const options = presets();
    const active = value.from !== null || value.to !== null;

    const apply = (range: DateRangeValue) => {
        onChange(range);
        setOpen(false);
    };

    const onOpenChange = (next: boolean) => {
        setOpen(next);
        // Start from what is applied now.
        setDraft(next ? { from: value.from ? parseDay(value.from) : undefined, to: value.to ? parseDay(value.to) : undefined } : undefined);
    };

    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    aria-label={`${label}: ${describeRange(value)}`}
                    className={cn(
                        'inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium shadow-xs transition-colors outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50',
                        active ? 'border-emerald-600/40 bg-emerald-50/60 dark:bg-emerald-950/30' : 'border-dashed',
                    )}
                >
                    <CalendarRange className="size-4 text-muted-foreground" aria-hidden="true" />
                    {describeRange(value)}
                    <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
                </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
                <div className="flex flex-col sm:flex-row">
                    <ul className="flex gap-1 overflow-x-auto border-b p-2 sm:w-36 sm:flex-col sm:border-r sm:border-b-0" aria-label="Quick ranges">
                        {options.map((preset) => {
                            const on = preset.range.from === value.from && preset.range.to === value.to;

                            return (
                                <li key={preset.label}>
                                    <button
                                        type="button"
                                        onClick={() => apply(preset.range)}
                                        aria-pressed={on}
                                        className={cn(
                                            'w-full rounded-md px-2 py-1.5 text-left text-sm whitespace-nowrap hover:bg-accent',
                                            on && 'bg-emerald-50 font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
                                        )}
                                    >
                                        {preset.label}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                    <div>
                        <Calendar
                            mode="range"
                            numberOfMonths={2}
                            selected={draft}
                            onSelect={setDraft}
                            defaultMonth={draft?.from ?? addDays(new Date(), -30)}
                            disabled={{ after: new Date() }}
                            className="hidden sm:block"
                        />
                        <Calendar
                            mode="range"
                            selected={draft}
                            onSelect={setDraft}
                            defaultMonth={draft?.from ?? new Date()}
                            disabled={{ after: new Date() }}
                            className="sm:hidden"
                        />
                        <div className="flex items-center justify-between gap-2 border-t px-3 py-2">
                            <p className="text-xs text-muted-foreground">
                                {draft?.from ? describeRange({ from: ymd(draft.from), to: draft.to ? ymd(draft.to) : null }) : 'Pick a start date'}
                            </p>
                            <Button
                                size="sm"
                                disabled={!draft?.from}
                                onClick={() => draft?.from && apply({ from: ymd(draft.from), to: ymd(draft.to ?? draft.from) })}
                                className="bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                                Apply
                            </Button>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
