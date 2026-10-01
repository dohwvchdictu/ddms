import { ArrowLeft, ArrowRight, Building2, Clock, ExternalLink, FileText, MapPin, MessageSquareText, RefreshCw, SearchX, UserRound, UserRoundCheck } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { tracking as trackingRoute } from '@/routes/documents';

interface TimelineRow {
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

interface Tracking {
    document: {
        id: number;
        control_no: string;
        subject: string;
        classification: string;
        status: string;
        turnaroundtime: string | null;
        current_location: string | null;
        created_at: string | null;
    };
    timeline: TimelineRow[];
}

/** Same palette as the search results (BuildsDocumentTimeline::statusColor). */
export const STATUS_STYLES: Record<string, string> = {
    Created: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-500/20 dark:text-neutral-300',
    'For Receiving': 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
    'On Process': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300',
    Returned: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
    Closed: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
};

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

export function documentUrl(controlNo: string): string {
    return `/document/view/${encodeURIComponent(controlNo)}`;
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

function Skeleton() {
    return (
        <div className="space-y-4 p-5" aria-hidden="true">
            <div className="h-24 animate-pulse rounded-lg bg-muted" />
            {[0, 1, 2].map((row) => (
                <div key={row} className="flex gap-4">
                    <div className="size-3 shrink-0 animate-pulse rounded-full bg-muted" />
                    <div className="grid flex-1 gap-2">
                        <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                    </div>
                </div>
            ))}
        </div>
    );
}

interface DocumentTrackingProps {
    documentId: number;
    controlNo: string;
    onBack: () => void;
}

/** The routing trail of one document, shown in place of the search results. */
export default function DocumentTracking({ documentId, controlNo, onBack }: DocumentTrackingProps) {
    const [data, setData] = useState<Tracking | null>(null);
    const [failed, setFailed] = useState(false);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setData(null);
        setFailed(false);

        fetch(trackingRoute.url(documentId), {
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'same-origin',
            signal: controller.signal,
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Tracking failed (${response.status})`);
                }

                return response.json() as Promise<Tracking>;
            })
            .then(setData)
            .catch((error: Error) => {
                if (error.name !== 'AbortError') {
                    setFailed(true);
                }
            });

        return () => controller.abort();
    }, [documentId, attempt]);

    const document = data?.document;

    return (
        <div className="flex max-h-[min(80vh,44rem)] flex-col">
            <div className="flex items-center gap-2 border-b px-3 py-2.5">
                <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-muted-foreground">
                    <ArrowLeft />
                    Results
                </Button>
                <span className="text-muted-foreground/50" aria-hidden="true">
                    /
                </span>
                <span className="min-w-0 flex-1 truncate font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    {controlNo}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto" aria-live="polite" aria-busy={!data && !failed}>
                {failed ? (
                    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
                        <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <SearchX className="size-5" />
                        </div>
                        <p className="text-sm font-medium">Couldn’t load the tracking</p>
                        <Button variant="outline" size="sm" onClick={() => setAttempt((value) => value + 1)}>
                            <RefreshCw />
                            Try again
                        </Button>
                    </div>
                ) : !data || !document ? (
                    <Skeleton />
                ) : (
                    <div className="space-y-5 p-5">
                        {/* Summary */}
                        <section className="rounded-lg border bg-muted/30 p-4">
                            <div className="flex items-start gap-3">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                                    <FileText className="size-5" aria-hidden="true" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span
                                            className={cn(
                                                'rounded-full px-2 py-0.5 text-xs font-medium',
                                                STATUS_STYLES[document.status] ?? STATUS_STYLES.Created,
                                            )}
                                        >
                                            {document.status}
                                        </span>
                                        <span className="truncate text-xs text-muted-foreground">{document.classification}</span>
                                    </div>
                                    <h3 className="mt-1.5 text-sm leading-snug font-semibold">{document.subject}</h3>
                                </div>
                            </div>

                            <dl className="mt-4 grid gap-3 border-t pt-3 text-sm sm:grid-cols-3">
                                <div>
                                    <dt className="text-xs text-muted-foreground">Currently at</dt>
                                    <dd className="mt-0.5 flex items-center gap-1.5 font-medium">
                                        <MapPin className="size-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
                                        <span className="truncate">{document.current_location ?? '—'}</span>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground">Created</dt>
                                    <dd className="mt-0.5 font-medium">
                                        {document.created_at ? dateFormat.format(new Date(document.created_at)) : '—'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground">Turnaround time</dt>
                                    <dd className="mt-0.5 font-medium">{document.turnaroundtime ?? '—'}</dd>
                                </div>
                            </dl>
                        </section>

                        {/* Timeline, newest first */}
                        <section aria-label="Routing history">
                            <h4 className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                Routing history · {data.timeline.length} {data.timeline.length === 1 ? 'step' : 'steps'}
                            </h4>

                            {data.timeline.length === 0 ? (
                                <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                                    No tracking information is available for this document yet.
                                </p>
                            ) : (
                                <ol className="relative">
                                    {data.timeline.map((row, index) => {
                                        const date = row.created_at ? new Date(row.created_at) : null;
                                        const last = index === data.timeline.length - 1;

                                        return (
                                            <li key={row.key} className="relative flex gap-4 pb-6 last:pb-0">
                                                {/* Rail and dot; the newest step is highlighted. */}
                                                {!last && (
                                                    <span aria-hidden="true" className="absolute top-4 bottom-0 left-[5px] w-px bg-border" />
                                                )}
                                                <span
                                                    aria-hidden="true"
                                                    className={cn(
                                                        'relative mt-1.5 size-[11px] shrink-0 rounded-full ring-4 ring-background',
                                                        index === 0 ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-600',
                                                    )}
                                                />

                                                <div className="min-w-0 flex-1 space-y-1.5">
                                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                        <span className={cn('rounded-md px-2 py-0.5 text-xs font-medium', actionTone(row.color))}>
                                                            {titleCase(row.action)}
                                                        </span>
                                                        {date && (
                                                            <time dateTime={row.created_at!} className="text-xs text-muted-foreground">
                                                                {dateFormat.format(date)} · {timeFormat.format(date)}
                                                            </time>
                                                        )}
                                                        {row.elapsed && (
                                                            <span
                                                                className="ml-auto inline-flex items-center gap-1 text-[0.7rem] text-muted-foreground"
                                                                title="Time since the previous step"
                                                            >
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
                            )}
                        </section>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between gap-2 border-t bg-muted/40 px-4 py-2.5">
                <p className="hidden text-xs text-muted-foreground sm:block">Press Backspace or Esc to go back.</p>
                <Button asChild size="sm" className="ml-auto">
                    <a href={documentUrl(controlNo)}>
                        Open document
                        <ExternalLink />
                    </a>
                </Button>
            </div>
        </div>
    );
}
