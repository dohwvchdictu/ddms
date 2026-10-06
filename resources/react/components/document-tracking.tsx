import { Link } from '@inertiajs/react';
import { ArrowLeft, ExternalLink, RefreshCw, SearchX } from 'lucide-react';
import { useEffect, useState } from 'react';
import DocumentTimeline, { type TimelineRow } from '@/components/document-timeline';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { tracking as trackingRoute } from '@/routes/documents';

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

const dateFormat = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

export function documentUrl(controlNo: string): string {
    return `/document/view/${encodeURIComponent(controlNo)}`;
}

/**
 * Where a document is, worded by its status. The location is the newest step's
 * office, which for a document still For Receiving is where it is *going*: it
 * isn't there until that office receives it.
 */
export function describeLocation(status: string, location: string | null): { label: string; office: string | null } {
    if (status === 'For Receiving') {
        return { label: 'Forwarded to', office: location };
    }

    if (status === 'Returned') {
        return { label: 'Returned to', office: location };
    }

    return { label: 'Currently at', office: location };
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
    /** Label of the back button; "Results" inside the search window. */
    backLabel?: string;
    /** Keyboard hint in the footer. */
    hint?: string;
    /** The footer's "Open document" button; off when already on that document's page. */
    showOpenLink?: boolean;
    /** Called as "Open document" navigates, so the window around it can close. */
    onOpen?: () => void;
}

/** One line: "Currently at X", or "Forwarded to X · awaiting receipt" while in transit. */
function locationText(status: string, location: string): string {
    const { label } = describeLocation(status, location);

    return status === 'For Receiving' ? `${label} ${location} · awaiting receipt` : `${label} ${location}`;
}

/** The routing trail of one document, shown in place of the search results. */
export default function DocumentTracking({
    documentId,
    controlNo,
    onBack,
    backLabel = 'Results',
    hint = 'Press Backspace or Esc to go back.',
    showOpenLink = true,
    onOpen,
}: DocumentTrackingProps) {
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
                    {backLabel}
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
                        {/* Summary: category and status, the subject, then where it is and since when. */}
                        <section className="space-y-1.5 border-b pb-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-medium text-muted-foreground">{document.classification}</span>
                                <span
                                    className={cn('rounded-full px-1.5 text-[0.65rem] leading-4 font-medium', STATUS_STYLES[document.status] ?? STATUS_STYLES.Created)}
                                >
                                    {document.status}
                                </span>
                            </div>
                            <h3 className="text-sm leading-snug font-semibold">{document.subject}</h3>
                            <p className="text-xs text-muted-foreground">
                                {[
                                    document.current_location && locationText(document.status, document.current_location),
                                    document.created_at && `Created ${dateFormat.format(new Date(document.created_at))}`,
                                    document.turnaroundtime && `Turnaround ${document.turnaroundtime}`,
                                ]
                                    .filter(Boolean)
                                    .join(' · ')}
                            </p>
                        </section>

                        {/* Timeline, newest first */}
                        <section aria-label="Routing history">
                            <h4 className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                Routing history · {data.timeline.length} {data.timeline.length === 1 ? 'step' : 'steps'}
                            </h4>

                            <DocumentTimeline rows={data.timeline} />
                        </section>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between gap-2 border-t bg-muted/40 px-4 py-2.5">
                <p className="hidden text-xs text-muted-foreground sm:block">{hint}</p>
                {showOpenLink && (
                    <Button asChild size="sm" className="ml-auto">
                        <Link href={documentUrl(controlNo)} onClick={onOpen}>
                            Open document
                            <ExternalLink />
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
}
