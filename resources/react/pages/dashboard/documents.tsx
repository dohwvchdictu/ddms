import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, FileSearch, Loader2, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { STATUS_STYLES } from '@/components/document-tracking';
import TrackingDialog from '@/components/tracking-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { parseDay } from '@/lib/working-days';
import { dashboard } from '@/routes';
import { documents as documentsRoute } from '@/routes/dashboard';

type Filter = 'for_action' | 'pending' | 'due_soon' | 'due_today' | 'overdue';

interface Row {
    id: number;
    control_no: string;
    subject: string;
    classification: string;
    status: string;
    office: string | null;
    created_at: string | null;
    due_date: string;
    days_left: number;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface Props {
    filter: Filter;
    search: string;
    documents: Paginated<Row>;
    counts: Record<Filter, number>;
}

/** Same order, names and colours as the dashboard cards. */
const FILTERS: { key: Filter; label: string; description: string; dot: string }[] = [
    { key: 'for_action', label: 'For Action', description: 'Waiting to be received by their office.', dot: 'bg-indigo-500' },
    { key: 'pending', label: 'Pending', description: 'Received and still in process.', dot: 'bg-sky-500' },
    { key: 'due_soon', label: 'Due Soon', description: 'Deadline within the next 3 working days.', dot: 'bg-yellow-500' },
    { key: 'due_today', label: 'Due Today', description: 'Deadline is today.', dot: 'bg-orange-500' },
    { key: 'overdue', label: 'Overdue', description: 'Past the required days and still not acted upon.', dot: 'bg-red-500' },
];

const number = new Intl.NumberFormat('en-PH');
const dateFormat = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

/** Working days to the deadline, in words, coloured by urgency. */
function DaysLeft({ days }: { days: number }) {
    // Working days; the column header says so, the tooltip spells it out.
    const plural = (n: number) => `${number.format(n)} ${n === 1 ? 'day' : 'days'}`;

    if (days < 0) {
        return <span className="font-medium text-red-700 dark:text-red-400">{plural(-days)} overdue</span>;
    }

    if (days === 0) {
        return <span className="font-medium text-orange-700 dark:text-orange-400">Due today</span>;
    }

    return (
        <span className={cn(days <= 3 ? 'font-medium text-yellow-700 dark:text-yellow-400' : 'text-muted-foreground')}>
            {plural(days)} left
        </span>
    );
}

const SEARCH_DEBOUNCE_MS = 350;

export default function DashboardDocuments({ filter, search, documents, counts }: Props) {
    const current = FILTERS.find((item) => item.key === filter) ?? FILTERS[4];
    const [query, setQuery] = useState(search);
    const [loading, setLoading] = useState(false);
    const [tracking, setTracking] = useState<Row | null>(null);
    const firstRender = useRef(true);

    // Search on the server, keeping the filter; replace history so Back
    // leaves the page instead of stepping through every keystroke.
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        const timer = window.setTimeout(() => {
            router.get(
                documentsRoute.url({ query: { filter, ...(query.trim() ? { search: query.trim() } : {}) } }),
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    onStart: () => setLoading(true),
                    onFinish: () => setLoading(false),
                },
            );
        }, SEARCH_DEBOUNCE_MS);

        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    const tabHref = (key: Filter) =>
        documentsRoute({ query: { filter: key, ...(search ? { search } : {}) } });

    return (
        <AppLayout>
            <Head title={`${current.label} documents`} />

            <nav aria-label="Breadcrumb">
                <ol className="flex items-center gap-2 text-sm whitespace-nowrap text-muted-foreground">
                    <li>
                        <Link href={dashboard()} className="hover:text-foreground">
                            Dashboard
                        </Link>
                    </li>
                    <ChevronRight className="size-4" aria-hidden="true" />
                    <li className="truncate font-semibold text-foreground" aria-current="page">
                        {current.label}
                    </li>
                </ol>
            </nav>

            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{current.label}</h1>
                    <p className="text-sm text-muted-foreground">
                        {current.description} {number.format(counts[filter])} open documents across DOH Western Visayas.
                    </p>
                </div>

                <div className="relative w-full sm:w-80">
                    {loading ? (
                        <Loader2 className="absolute top-1/2 left-3 size-4 -translate-y-1/2 animate-spin text-emerald-600" aria-hidden="true" />
                    ) : (
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    )}
                    <input
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search subject or control number…"
                        aria-label={`Search ${current.label} documents`}
                        autoComplete="off"
                        className="h-10 w-full rounded-lg border bg-background pr-9 pl-9 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:text-foreground"
                            aria-label="Clear search"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Filter tabs: switch card without going back to the dashboard. */}
            <div role="tablist" aria-label="Filter" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
                {FILTERS.map((item) => (
                    <Link
                        key={item.key}
                        href={tabHref(item.key)}
                        role="tab"
                        aria-selected={item.key === filter}
                        preserveScroll
                        className={cn(
                            'flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                            item.key === filter
                                ? 'border-emerald-600 bg-emerald-600 text-white'
                                : 'bg-background text-foreground/80 hover:bg-accent',
                        )}
                    >
                        <span className={cn('size-2 rounded-full', item.dot)} aria-hidden="true" />
                        {item.label}
                        <span className={cn('text-xs tabular-nums', item.key === filter ? 'text-white/80' : 'text-muted-foreground')}>
                            {number.format(counts[item.key])}
                        </span>
                    </Link>
                ))}
            </div>

            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                {documents.data.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
                        <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <FileSearch className="size-5" />
                        </div>
                        <p className="text-sm font-medium">No documents found</p>
                        <p className="text-sm text-muted-foreground">
                            {search ? `Nothing in ${current.label} matches “${search}”.` : `There are no ${current.label.toLowerCase()} documents right now.`}
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/40 hover:bg-muted/40">
                                <TableHead className="pl-4">Control no.</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Currently at</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="pr-4" title="Counted in working days">
                                    Deadline
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {documents.data.map((row) => (
                                <TableRow key={row.id} className="cursor-pointer" onClick={() => setTracking(row)}>
                                    <TableCell className="pl-4">
                                        {/* The real control for keyboard and screen-reader users. */}
                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                setTracking(row);
                                            }}
                                            className="rounded font-mono text-xs font-semibold text-emerald-700 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50 dark:text-emerald-400"
                                            aria-label={`Show tracking for ${row.control_no}`}
                                        >
                                            {row.control_no}
                                        </button>
                                    </TableCell>
                                    <TableCell className="max-w-sm min-w-56 whitespace-normal">
                                        <p className="line-clamp-2 text-sm">{row.subject}</p>
                                        <p className="truncate text-xs text-muted-foreground">{row.classification}</p>
                                    </TableCell>
                                    <TableCell className="max-w-48 truncate text-sm" title={row.office ?? undefined}>
                                        {row.office ?? '—'}
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={cn(
                                                'rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
                                                STATUS_STYLES[row.status] ?? STATUS_STYLES.Created,
                                            )}
                                        >
                                            {row.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                                        {row.created_at ? dateFormat.format(new Date(row.created_at)) : '—'}
                                    </TableCell>
                                    <TableCell className="pr-4 text-sm whitespace-nowrap">
                                        <p>{dateFormat.format(parseDay(row.due_date))}</p>
                                        <p className="text-xs" title="Working days">
                                            <DaysLeft days={row.days_left} />
                                        </p>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                {documents.total > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm">
                        <p className="text-muted-foreground">
                            Showing <span className="font-medium text-foreground">{number.format(documents.from ?? 0)}</span>–
                            <span className="font-medium text-foreground">{number.format(documents.to ?? 0)}</span> of{' '}
                            <span className="font-medium text-foreground">{number.format(documents.total)}</span>
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                                Page {documents.current_page} of {documents.last_page}
                            </span>
                            <PageLink href={documents.prev_page_url} label="Previous page">
                                <ChevronLeft className="size-4" />
                            </PageLink>
                            <PageLink href={documents.next_page_url} label="Next page">
                                <ChevronRight className="size-4" />
                            </PageLink>
                        </div>
                    </div>
                )}
            </div>

            <TrackingDialog document={tracking} onClose={() => setTracking(null)} />
        </AppLayout>
    );
}

function PageLink({ href, label, children }: { href: string | null; label: string; children: React.ReactNode }) {
    const className = 'flex size-8 items-center justify-center rounded-md border';

    return href ? (
        <Link href={href} preserveScroll aria-label={label} className={cn(className, 'hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none')}>
            {children}
        </Link>
    ) : (
        <span aria-disabled="true" aria-label={label} className={cn(className, 'text-muted-foreground opacity-50')}>
            {children}
        </span>
    );
}
