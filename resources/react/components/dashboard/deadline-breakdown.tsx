import { Link } from '@inertiajs/react';
import { AlarmClock, CircleAlert, CircleCheck, Clock, ChevronRight, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { documents as documentsRoute } from '@/routes/dashboard';

export interface DeadlineCounts {
    on_track: number;
    due_soon: number;
    due_today: number;
    overdue: number;
    total: number;
}

/**
 * Status colours (good / warning / serious / critical) from the fixed status
 * palette, always paired with an icon and a label so colour never carries the
 * meaning alone. On Track has no list page, so its row is not a link.
 */
const ROWS: { key: keyof Omit<DeadlineCounts, 'total'>; label: string; icon: LucideIcon; color: string; linked: boolean }[] = [
    { key: 'on_track', label: 'On track', icon: CircleCheck, color: 'var(--chart-good)', linked: false },
    { key: 'due_soon', label: 'Due soon', icon: Clock, color: 'var(--chart-warning)', linked: true },
    { key: 'due_today', label: 'Due today', icon: AlarmClock, color: 'var(--chart-serious)', linked: true },
    { key: 'overdue', label: 'Overdue', icon: CircleAlert, color: 'var(--chart-critical)', linked: true },
];

const number = new Intl.NumberFormat('en-PH');
const percent = new Intl.NumberFormat('en-PH', { style: 'percent', maximumFractionDigits: 0 });

/** How the open queue splits by time left: one bar per state, on a shared scale. */
export default function DeadlineBreakdown({ counts }: { counts: DeadlineCounts }) {
    const max = Math.max(...ROWS.map((row) => counts[row.key]), 1);

    return (
        <Card className="gap-4 p-5">
            <div>
                <h2 className="text-sm font-semibold">Deadlines</h2>
                <p className="text-xs text-muted-foreground">
                    {number.format(counts.total)} open documents by time left
                </p>
            </div>

            <ul className="grid gap-1">
                {ROWS.map(({ key, label, icon: Icon, color, linked }) => {
                    const value = counts[key];
                    const share = counts.total ? value / counts.total : 0;
                    const body = (
                        <>
                            <div className="flex items-center gap-2 text-sm">
                                <Icon className="size-4 shrink-0" style={{ color }} aria-hidden="true" />
                                <span className="font-medium">{label}</span>
                                <span className="ml-auto font-semibold tabular-nums">{number.format(value)}</span>
                                <span className="w-9 text-right text-xs text-muted-foreground tabular-nums">{percent.format(share)}</span>
                                <ChevronRight className={cn('size-4 shrink-0 text-muted-foreground', !linked && 'invisible')} aria-hidden="true" />
                            </div>
                            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                                <div className="h-full rounded-full" style={{ width: `${(value / max) * 100}%`, backgroundColor: color }} />
                            </div>
                        </>
                    );

                    return (
                        <li key={key}>
                            {linked ? (
                                <Link
                                    href={documentsRoute({ query: { filter: key } })}
                                    className="block rounded-md px-2 py-2 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50"
                                    aria-label={`${label}: ${number.format(value)} documents. View the list.`}
                                >
                                    {body}
                                </Link>
                            ) : (
                                <div className="px-2 py-2">{body}</div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </Card>
    );
}
