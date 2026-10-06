import { Deferred, Head, Link, router } from '@inertiajs/react';
import { FileSearch } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { LoadFailed, LoadingBody, TableSkeleton } from '@/components/data-table/deferred-states';
import Pagination from '@/components/pagination';
import SearchInput from '@/components/search-input';
import StatusBadge from '@/components/status-badge';
import TrackingDialog from '@/components/tracking-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { parseDay } from '@/lib/working-days';
import { dashboard } from '@/routes';
import { documents as documentsRoute } from '@/routes/dashboard';
import type { Paginated } from '@/types';

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

interface Props {
    filter: Filter;
    search: string;
    /** Deferred, with counts: undefined until they arrive after the page opens. */
    documents?: Paginated<Row>;
    counts?: Record<Filter, number>;
}

/** Same order, names and colours as the dashboard cards. */
const FILTERS: { key: Filter; label: string; dot: string }[] = [
    { key: 'for_action', label: 'For Action', dot: 'bg-indigo-500' },
    { key: 'pending', label: 'Pending', dot: 'bg-sky-500' },
    { key: 'due_soon', label: 'Due Soon', dot: 'bg-yellow-500' },
    { key: 'due_today', label: 'Due Today', dot: 'bg-orange-500' },
    { key: 'overdue', label: 'Overdue', dot: 'bg-red-500' },
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

    return <span className={cn(days <= 3 ? 'font-medium text-yellow-700 dark:text-yellow-400' : 'text-muted-foreground')}>{plural(days)} left</span>;
}

const SEARCH_DEBOUNCE_MS = 350;

/** Reloaded by name on search, tab changes and page turns, so the old rows stay up meanwhile. */
const RELOAD = ['filter', 'search', 'documents', 'counts'];

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
                    only: RELOAD,
                    onStart: () => setLoading(true),
                    onFinish: () => setLoading(false),
                },
            );
        }, SEARCH_DEBOUNCE_MS);

        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    const tabHref = (key: Filter) => documentsRoute({ query: { filter: key, ...(search ? { search } : {}) } });

    return (
        <AppLayout
            breadcrumbs={[{ title: 'Home', href: dashboard() }, { title: current.label }]}
            title={current.label}
            actions={
                <SearchInput
                    value={query}
                    onChange={setQuery}
                    placeholder="Search subject or control number…"
                    label={`Search ${current.label} documents`}
                    loading={loading}
                    resultCount={documents && search && query.trim() === search ? documents.total : undefined}
                    className="w-full sm:w-80"
                />
            }
        >
            <Head title={`${current.label} documents`} />

            {/* Filter tabs: switch card without going back to the dashboard. */}
            <div role="tablist" aria-label="Filter" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
                {FILTERS.map((item) => (
                    <Link
                        key={item.key}
                        href={tabHref(item.key)}
                        role="tab"
                        aria-selected={item.key === filter}
                        preserveScroll
                        preserveState
                        only={RELOAD}
                        onStart={() => setLoading(true)}
                        onFinish={() => setLoading(false)}
                        className={cn(
                            'flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                            item.key === filter ? 'border-emerald-600 bg-emerald-600 text-white' : 'bg-background text-foreground/80 hover:bg-accent',
                        )}
                    >
                        <span className={cn('size-2 rounded-full', item.dot)} aria-hidden="true" />
                        {item.label}
                        {counts && (
                            <span className={cn('text-xs tabular-nums', item.key === filter ? 'text-white/80' : 'text-muted-foreground')}>
                                {number.format(counts[item.key])}
                            </span>
                        )}
                    </Link>
                ))}
            </div>

            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <Deferred data="documents" fallback={<TableSkeleton columns={4} />} rescue={<LoadFailed only={RELOAD} what="the documents" />}>
                    {documents && (
                        <>
                            <LoadingBody loading={loading}>
                                {documents.data.length === 0 ? (
                                    <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
                                        <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                            <FileSearch className="size-5" />
                                        </div>
                                        <p className="text-sm font-medium">No documents found</p>
                                        <p className="text-sm text-muted-foreground">
                                            {search
                                                ? `Nothing in ${current.label} matches “${search}”.`
                                                : `There are no ${current.label.toLowerCase()} documents right now.`}
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
                                                        <StatusBadge status={row.status} />
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
                            </LoadingBody>

                            <Pagination page={documents} only={RELOAD} />
                        </>
                    )}
                </Deferred>
            </div>

            <TrackingDialog document={tracking} onClose={() => setTracking(null)} />
        </AppLayout>
    );
}
