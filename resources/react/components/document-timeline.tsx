import { ArrowRight, Building2, Clock, MessageSquareText, UserRound, UserRoundCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** One step of a routing trail, as App\Actions\Documents\DocumentTracking sends it. */
export interface TimelineRow {
    key: string;
    action: string;
    /** A Tailwind 3 class stored on the action, e.g. "bg-teal-100". */
    color: string;
    created_at: string | null;
    description: string | null;
    offices: { label: string; name: string }[];
    endorsed_to: string | null;
    user: string | null;
    remarks: string | null;
    elapsed: string | null;
}

/**
 * Action colours live in the database as Tailwind 3 classes ("bg-teal-100").
 * Tailwind 4 only builds classes it can see in this code, so map the colour
 * name to class strings written out in full here.
 */
const ACTION_TONES: Record<string, string> = {
    teal: 'bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300',
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
    gray: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-500/20 dark:text-neutral-300',
    cyan: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300',
    violet: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    sky: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
    pink: 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300',
    emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
};

function actionTone(color: string): string {
    const name = /bg-([a-z]+)-\d+/.exec(color)?.[1] ?? 'gray';

    return ACTION_TONES[name] ?? ACTION_TONES.gray;
}

const dateFormat = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
const timeFormat = new Intl.DateTimeFormat('en-PH', { hour: 'numeric', minute: '2-digit' });

function titleCase(value: string): string {
    return value.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Detail({ icon: Icon, label, children }: { icon: typeof Clock; label: string; children: ReactNode }) {
    return (
        <p className="flex items-start gap-2 text-sm">
            <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="min-w-0">
                <span className="text-muted-foreground">{label}: </span>
                {children}
            </span>
        </p>
    );
}

function Offices({ offices }: { offices: TimelineRow['offices'] }) {
    const from = offices.find((office) => office.label === 'From');
    const to = offices.find((office) => office.label === 'To');

    // A hop with both ends reads as one line: From → To.
    if (from && to) {
        return (
            <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm">
                <Building2 className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span>{from.name}</span>
                <ArrowRight className="size-3.5 shrink-0 text-emerald-600" aria-label="to" />
                <span className="font-medium">{to.name}</span>
            </p>
        );
    }

    return (
        <>
            {offices.map((office) => (
                <Detail key={office.label} icon={Building2} label={office.label}>
                    {office.name}
                </Detail>
            ))}
        </>
    );
}

/** A document's routing trail, newest step first, the newest highlighted. */
export default function DocumentTimeline({ rows }: { rows: TimelineRow[] }) {
    if (rows.length === 0) {
        return (
            <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                No tracking information is available for this document yet.
            </p>
        );
    }

    return (
        <ol className="relative">
            {rows.map((row, index) => {
                const date = row.created_at ? new Date(row.created_at) : null;
                const last = index === rows.length - 1;

                return (
                    <li key={row.key} className="relative flex gap-4 pb-6 last:pb-0">
                        {!last && <span aria-hidden="true" className="absolute top-4 bottom-0 left-[5px] w-px bg-border" />}
                        <span
                            aria-hidden="true"
                            className={cn(
                                'relative mt-1.5 size-[11px] shrink-0 rounded-full ring-4 ring-background',
                                index === 0 ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-600',
                            )}
                        />

                        <div className="min-w-0 flex-1 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span className={cn('rounded-md px-2 py-0.5 text-xs font-medium', actionTone(row.color))}>{titleCase(row.action)}</span>
                                {date && (
                                    <time dateTime={row.created_at!} className="text-xs text-muted-foreground">
                                        {dateFormat.format(date)} · {timeFormat.format(date)}
                                    </time>
                                )}
                                {row.elapsed && (
                                    <span className="ml-auto inline-flex items-center gap-1 text-[0.7rem] text-muted-foreground" title="Time since the previous step">
                                        <Clock className="size-3" aria-hidden="true" />+{row.elapsed}
                                    </span>
                                )}
                            </div>

                            {row.description && <p className="text-sm font-medium">{row.description}</p>}

                            <Offices offices={row.offices} />

                            {row.endorsed_to && (
                                <Detail icon={UserRoundCheck} label="Endorsed to">
                                    {row.endorsed_to}
                                </Detail>
                            )}
                            {row.user && (
                                <Detail icon={UserRound} label="By">
                                    {row.user}
                                </Detail>
                            )}
                            {row.remarks && (
                                <p className="flex gap-2 rounded-md border-l-2 border-emerald-500/60 bg-muted/50 px-3 py-2 text-sm">
                                    <MessageSquareText className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                                    <span className="min-w-0 break-words">{row.remarks}</span>
                                </p>
                            )}
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}
