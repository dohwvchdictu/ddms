import { Deferred, Head } from '@inertiajs/react';
import { ArrowRight, ExternalLink, Globe, Printer } from 'lucide-react';
import DateRangeFilter, { describeRange, isSameRange, rangeQuery, type DateRangeValue } from '@/components/data-table/date-range-filter';
import FilterChips, { type FilterChip } from '@/components/data-table/filter-chips';
import ListTabs from '@/components/data-table/list-tabs';
import SortableHead from '@/components/data-table/sortable-head';
import ViewOptions from '@/components/data-table/view-options';
import Pagination from '@/components/pagination';
import { LoadingBody, LoadFailed, TableSkeleton } from '@/components/data-table/deferred-states';
import SearchInput from '@/components/search-input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useListFilters } from '@/hooks/use-list-filters';
import { useTablePreferences } from '@/hooks/use-table-preferences';
import AppLayout from '@/layouts/app-layout';
import { printPage } from '@/lib/print-page';
import { cn } from '@/lib/utils';
import { documents as printExternal } from '@/routes/print/external';
import { external as externalReport } from '@/routes/reports';
import type { Paginated } from '@/types';

type State = 'overdue' | 'due' | 'pending' | 'complete';
type Tab = 'all' | State;

interface Office {
    code: string | null;
    name: string | null;
}

interface Row {
    id: number;
    control_no: string;
    subject: string;
    classification: string;
    status: string;
    is_bundle: boolean;
    created_at: string | null;
    encoded_by: string | null;
    origin: Office | null;
    /** The first office it was routed to. */
    first_destination: Office | null;
    now_at: Office | null;
    remarks: string | null;
    /** Working days its charter or category allows. */
    required_days: number;
    /** Working days left: negative when overdue, null once closed. */
    remaining: number | null;
    state: State;
    deadline_label: string;
}

interface Filters {
    state: Tab;
    search: string;
    from: string | null;
    to: string | null;
    sort: string;
    per_page: number;
    [key: string]: unknown;
}

interface Props {
    /** Deferred, with counts: undefined until they arrive after the page opens. */
    requests?: Paginated<Row>;
    filters: Filters;
    counts?: Record<Tab, number>;
    /** The last 30 days: what the report shows with no dates in the URL. */
    defaultRange: DateRangeValue;
    perPageOptions: number[];
}

const DEFAULT_SORT = '-created_at';
const DEFAULT_PER_PAGE = 25;

/** Most urgent first. */
const TABS: { value: Tab; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'due', label: 'Due soon' },
    { value: 'pending', label: 'In progress' },
    { value: 'complete', label: 'Completed' },
];

const STATE_STYLES: Record<State, string> = {
    overdue: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300',
    due: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
    pending: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300',
    complete: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
};

/** Columns View options can hide; Control no. always shows. */
const COLUMNS = [
    { id: 'received', label: 'Received' },
    { id: 'title', label: 'Document Title' },
    { id: 'route', label: 'Route' },
    { id: 'required', label: 'Required Days' },
    { id: 'remaining', label: 'Days Remaining' },
    { id: 'status', label: 'Current Status' },
    { id: 'remarks', label: 'Remarks' },
];

const dateFormat = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
const place = (office: Office | null) => office?.code ?? office?.name ?? '—';

const toQuery = (filters: Filters, defaultRange: DateRangeValue) => ({
    state: filters.state === 'all' ? undefined : filters.state,
    search: filters.search.trim() || undefined,
    ...rangeQuery(filters, defaultRange),
    sort: filters.sort === DEFAULT_SORT ? undefined : filters.sort,
    per_page: filters.per_page === DEFAULT_PER_PAGE ? undefined : filters.per_page,
});

/** A filter change or page turn reloads just these, so the old rows stay up meanwhile. */
const RELOAD = ['filters', 'requests', 'counts'];

const documentUrl = (controlNo: string) => `/document/view/${encodeURIComponent(controlNo)}`;

export default function ExternalRequestsReport({ requests, filters: initial, counts, defaultRange, perPageOptions }: Props) {
    const toUrl = (filters: Filters) => externalReport.url({ query: toQuery(filters, defaultRange) });
    const { filters, update, loading } = useListFilters(initial, toUrl, { debounce: ['search'], only: RELOAD });
    const { preferences, isVisible, toggleColumn, setDense } = useTablePreferences('report-external');

    const chips: FilterChip[] = [
        filters.search && { key: 'search', label: 'Search', value: `“${filters.search}”`, onRemove: () => update({ search: '' }) },
        !isSameRange(filters, defaultRange) && {
            key: 'received',
            label: 'Received',
            value: describeRange(filters),
            onRemove: () => update({ ...defaultRange }),
        },
    ].filter((chip): chip is FilterChip => Boolean(chip));

    const reset = () => update({ search: '', ...defaultRange });

    // The printout follows the screen: same period, search, tab and order (every row, no pages).
    const print = () =>
        printPage(printExternal.url({ query: { ...toQuery(filters, defaultRange), per_page: undefined } }), { title: 'External Requests report' });

    return (
        <AppLayout
            title="External Requests"
            actions={
                <Button variant="outline" onClick={print}>
                    <Printer />
                    Print
                </Button>
            }
        >
            <Head title="External Requests" />

            <div className="relative overflow-clip rounded-xl border bg-card shadow-sm">
                {loading && (
                    <div
                        className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-emerald-100 dark:bg-emerald-950"
                        role="progressbar"
                        aria-label="Loading"
                    >
                        <div className="h-full w-1/3 animate-[table-progress_1s_ease-in-out_infinite] bg-emerald-600" />
                    </div>
                )}

                <ListTabs
                    label="Deadline"
                    value={filters.state}
                    onChange={(state) => update({ state: state as Tab })}
                    tabs={TABS.map((tab) => ({ ...tab, count: counts?.[tab.value] }))}
                />

                <div className="flex min-h-15 flex-wrap items-center gap-2 border-b p-3">
                    <SearchInput
                        value={filters.search}
                        onChange={(search) => update({ search })}
                        placeholder="Search subject or control no.…"
                        label="Search external requests"
                        loading={loading}
                        resultCount={requests && filters.search.trim() === initial.search ? requests.total : undefined}
                        className="w-full sm:max-w-md sm:min-w-72 sm:flex-1"
                    />
                    <DateRangeFilter label="Received" value={{ from: filters.from, to: filters.to }} onChange={({ from, to }) => update({ from, to })} />
                    <div className="ml-auto">
                        <ViewOptions
                            columns={COLUMNS}
                            isVisible={isVisible}
                            onToggleColumn={toggleColumn}
                            dense={preferences.dense}
                            onDenseChange={setDense}
                            perPage={filters.per_page}
                            perPageOptions={perPageOptions}
                            onPerPageChange={(per_page) => update({ per_page })}
                        />
                    </div>
                </div>
                <FilterChips chips={chips} onReset={reset} />

                <Deferred data="requests" fallback={<TableSkeleton columns={4} />} rescue={<LoadFailed only={RELOAD} />}>
                    {requests && (
                        <>
                            <LoadingBody loading={loading}>
                                {requests.data.length === 0 ? (
                                    <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
                                        <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                            <Globe className="size-5" />
                                        </div>
                                        <p className="text-sm font-medium">
                                            {chips.length > 0 || filters.state !== 'all'
                                                ? 'No external requests match these filters'
                                                : 'No external requests in the last 30 days'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {chips.length > 0
                                                ? 'Try another date range or search.'
                                                : 'External requests your office encodes show here with their deadlines.'}
                                        </p>
                                        {chips.length > 0 && (
                                            <Button variant="outline" size="sm" onClick={reset} className="mt-2">
                                                Reset filters
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <Table className={cn(preferences.dense ? '[&_td]:py-1.5' : '[&_td]:py-3')}>
                                        <TableHeader>
                                            <TableRow className="bg-muted/40 hover:bg-muted/40">
                                                <TableHead className="pl-4">Document Control No.</TableHead>
                                                {isVisible('received') && (
                                                    <SortableHead
                                                        column="created_at"
                                                        sort={filters.sort}
                                                        onSort={(sort) => update({ sort })}
                                                        firstDirection="desc"
                                                    >
                                                        Received
                                                    </SortableHead>
                                                )}
                                                {isVisible('title') && <TableHead>Document Title</TableHead>}
                                                {isVisible('route') && <TableHead>Route</TableHead>}
                                                {isVisible('required') && <TableHead className="text-center">Required Days</TableHead>}
                                                {isVisible('remaining') && (
                                                    // One direction only: most urgent first.
                                                    <SortableHead
                                                        column="remaining"
                                                        sort={filters.sort}
                                                        onSort={() => update({ sort: filters.sort === 'remaining' ? DEFAULT_SORT : 'remaining' })}
                                                    >
                                                        Days Remaining
                                                    </SortableHead>
                                                )}
                                                {isVisible('status') && <TableHead>Current Status</TableHead>}
                                                {isVisible('remarks') && <TableHead className="pr-4">Remarks</TableHead>}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {requests.data.map((row) => (
                                                <TableRow key={row.id}>
                                                    <TableCell className="pl-4 align-top">
                                                        <a
                                                            href={documentUrl(row.control_no)}
                                                            target="_blank"
                                                            rel="noopener"
                                                            title="Open in a new tab"
                                                            className="inline-flex items-center gap-1 rounded font-mono text-sm font-semibold text-emerald-700 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50 dark:text-emerald-400"
                                                        >
                                                            {row.control_no}
                                                            <ExternalLink className="size-3" aria-hidden="true" />
                                                        </a>
                                                        {row.encoded_by && <p className="mt-0.5 text-xs text-muted-foreground">By {row.encoded_by}</p>}
                                                    </TableCell>
                                                    {isVisible('received') && (
                                                        <TableCell className="align-top text-sm whitespace-nowrap">
                                                            {row.created_at ? dateFormat.format(new Date(row.created_at)) : '—'}
                                                        </TableCell>
                                                    )}
                                                    {isVisible('title') && (
                                                        <TableCell className="max-w-sm min-w-56 align-top text-sm whitespace-normal">
                                                            <p className={cn(preferences.dense ? 'line-clamp-1' : 'line-clamp-2')} title={row.subject}>
                                                                {row.subject}
                                                            </p>
                                                            <p className="mt-0.5 text-xs text-muted-foreground">{row.classification}</p>
                                                        </TableCell>
                                                    )}
                                                    {isVisible('route') && (
                                                        <TableCell className="min-w-44 align-top text-sm whitespace-normal">
                                                            {/* Where it started → where it was first sent; then where it is now. */}
                                                            <p className="flex items-center gap-1.5">
                                                                <span title={row.origin?.name ?? undefined}>{place(row.origin)}</span>
                                                                <ArrowRight className="size-3 text-muted-foreground" aria-label="forwarded to" />
                                                                <span title={row.first_destination?.name ?? undefined}>{place(row.first_destination)}</span>
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Now at <span title={row.now_at?.name ?? undefined}>{place(row.now_at)}</span>
                                                            </p>
                                                        </TableCell>
                                                    )}
                                                    {isVisible('required') && (
                                                        <TableCell className="text-center align-top text-sm tabular-nums">{row.required_days}</TableCell>
                                                    )}
                                                    {isVisible('remaining') && (
                                                        <TableCell className="align-top whitespace-nowrap">
                                                            <span
                                                                className={cn(
                                                                    'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                                                                    STATE_STYLES[row.state],
                                                                )}
                                                            >
                                                                {row.deadline_label}
                                                            </span>
                                                        </TableCell>
                                                    )}
                                                    {isVisible('status') && <TableCell className="align-top text-sm whitespace-nowrap">{row.status}</TableCell>}
                                                    {isVisible('remarks') && (
                                                        <TableCell className="max-w-64 min-w-40 pr-4 align-top text-sm whitespace-normal">
                                                            {row.remarks ? (
                                                                <p className={cn(preferences.dense ? 'line-clamp-1' : 'line-clamp-3')} title={row.remarks}>
                                                                    {row.remarks}
                                                                </p>
                                                            ) : (
                                                                <span className="text-muted-foreground">—</span>
                                                            )}
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </LoadingBody>

                            <Pagination page={requests} only={RELOAD} />
                        </>
                    )}
                </Deferred>
            </div>
        </AppLayout>
    );
}
