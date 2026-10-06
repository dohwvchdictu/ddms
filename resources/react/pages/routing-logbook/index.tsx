import { Deferred, Head, usePoll } from '@inertiajs/react';
import { BookOpen, Check, ExternalLink, Undo2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { LoadFailed, LoadingBody, TableSkeleton } from '@/components/data-table/deferred-states';
import DateRangeFilter, { describeRange, isSameRange, rangeQuery, type DateRangeValue } from '@/components/data-table/date-range-filter';
import FilterChips, { type FilterChip } from '@/components/data-table/filter-chips';
import ListTabs from '@/components/data-table/list-tabs';
import SortableHead from '@/components/data-table/sortable-head';
import ViewOptions from '@/components/data-table/view-options';
import Pagination from '@/components/pagination';
import SearchInput from '@/components/search-input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useListFilters } from '@/hooks/use-list-filters';
import { useTablePreferences } from '@/hooks/use-table-preferences';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { routingLogbook } from '@/routes';
import type { Paginated } from '@/types';

type Receipt = 'all' | 'awaiting' | 'received' | 'returned';

/** One hand-over: a document this office forwarded, and what the other office did with it. */
interface Entry {
    id: number;
    document_id: number;
    control_no: string;
    subject: string;
    classification: string | null;
    is_bundle: boolean;
    to: { code: string | null; name: string | null };
    forwarded_at: string | null;
    receipt: Exclude<Receipt, 'all'>;
    received_at: string | null;
    received_by: string | null;
    returned_at: string | null;
}

interface Filters {
    receipt: Receipt;
    search: string;
    from: string | null;
    to: string | null;
    sort: string;
    per_page: number;
    [key: string]: unknown;
}

interface Props {
    /** Deferred: undefined until it arrives after the page opens. */
    entries?: Paginated<Entry>;
    filters: Filters;
    counts?: Record<Receipt, number>;
    /** The last 7 days: what the page shows with no dates in the URL. */
    defaultRange: DateRangeValue;
    perPageOptions: number[];
}

/** Reloaded by name on filter changes, page turns and actions, so the old rows stay up meanwhile. */
const RELOAD = ['filters', 'entries', 'counts'];

const DEFAULT_SORT = '-created_at';
const DEFAULT_PER_PAGE = 25;

/** How often the page checks for new receipts. */
const POLL_MS = 5000;

const RECEIPT_TABS: { value: Receipt; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'awaiting', label: 'Awaiting' },
    { value: 'received', label: 'Received' },
    { value: 'returned', label: 'Returned' },
];

/** Columns View options can hide; Control no. always shows. */
const COLUMNS = [
    { id: 'subject', label: 'Subject' },
    { id: 'to', label: 'Forwarded to' },
    { id: 'forwarded', label: 'Forwarded' },
    { id: 'receipt', label: 'Receipt' },
];

const dateFormat = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
const timeFormat = new Intl.DateTimeFormat('en-PH', { hour: 'numeric', minute: '2-digit' });
const stamp = (iso: string) => `${dateFormat.format(new Date(iso))} · ${timeFormat.format(new Date(iso))}`;

export default function RoutingLogbook({ entries, filters: initial, counts, defaultRange, perPageOptions }: Props) {
    const toUrl = (filters: Filters) =>
        routingLogbook.url({
            query: {
                receipt: filters.receipt === 'all' ? undefined : filters.receipt,
                search: filters.search.trim() || undefined,
                ...rangeQuery(filters, defaultRange),
                sort: filters.sort === DEFAULT_SORT ? undefined : filters.sort,
                per_page: filters.per_page === DEFAULT_PER_PAGE ? undefined : filters.per_page,
            },
        });

    const { filters, update, loading } = useListFilters(initial, toUrl, { debounce: ['search'], only: RELOAD });
    const { preferences, isVisible, toggleColumn, setDense } = useTablePreferences('routing-logbook');

    // Live: receipts show up without a reload. Paused while the tab is hidden.
    usePoll(POLL_MS, { only: ['entries', 'counts'], showProgress: false });

    const chips: FilterChip[] = [
        filters.search && { key: 'search', label: 'Search', value: `“${filters.search}”`, onRemove: () => update({ search: '' }) },
        !isSameRange(filters, defaultRange) && {
            key: 'forwarded',
            label: 'Forwarded',
            value: describeRange(filters),
            onRemove: () => update({ ...defaultRange }),
        },
    ].filter((chip): chip is FilterChip => Boolean(chip));

    const reset = () => update({ search: '', ...defaultRange });

    return (
        <AppLayout
            title="Routing Logbook"
            actions={
                <span
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400"
                    title={`Updates every ${POLL_MS / 1000} seconds`}
                >
                    <span className="relative flex size-2">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                    </span>
                    Live
                </span>
            }
        >
            <Head title="Routing Logbook" />

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
                    label="Receipt"
                    value={filters.receipt}
                    onChange={(receipt) => update({ receipt: receipt as Receipt })}
                    tabs={RECEIPT_TABS.map((tab) => ({ ...tab, count: counts?.[tab.value] }))}
                />

                <div className="flex min-h-15 flex-wrap items-center gap-2 border-b p-3">
                    <SearchInput
                        value={filters.search}
                        onChange={(search) => update({ search })}
                        placeholder="Search subject or control no.…"
                        label="Search the routing logbook"
                        loading={loading}
                        resultCount={entries && filters.search.trim() === initial.search ? entries.total : undefined}
                        className="w-full sm:max-w-md sm:min-w-72 sm:flex-1"
                    />
                    <DateRangeFilter label="Forwarded" value={{ from: filters.from, to: filters.to }} onChange={({ from, to }) => update({ from, to })} />
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

                <Deferred data="entries" fallback={<TableSkeleton columns={4} />} rescue={<LoadFailed only={RELOAD} what="the logbook" />}>
                    {entries && (
                        <>
                            <LoadingBody loading={loading}>
                                {entries.data.length === 0 ? (
                                    <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
                                        <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                            <BookOpen className="size-5" />
                                        </div>
                                        <p className="text-sm font-medium">
                                            {chips.length > 0 || filters.receipt !== 'all' ? 'Nothing matches these filters' : 'Nothing forwarded yet'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {chips.length > 0
                                                ? 'Try another date range or search.'
                                                : 'Documents your office forwards show here, with whether they have been received.'}
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
                                                <TableHead className="pl-4">Control no.</TableHead>
                                                {isVisible('subject') && <TableHead>Subject</TableHead>}
                                                {isVisible('to') && <TableHead>Forwarded to</TableHead>}
                                                {isVisible('forwarded') && (
                                                    <SortableHead column="created_at" sort={filters.sort} onSort={(sort) => update({ sort })}>
                                                        Forwarded
                                                    </SortableHead>
                                                )}
                                                {isVisible('receipt') && <TableHead className="pr-4">Receipt</TableHead>}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {entries.data.map((entry) => (
                                                <TableRow
                                                    key={entry.id}
                                                    className={cn(entry.receipt === 'received' && 'bg-emerald-50/50 dark:bg-emerald-950/15')}
                                                >
                                                    <TableCell className="pl-4 align-top">
                                                        <a
                                                            href={documentUrl(entry.control_no)}
                                                            target="_blank"
                                                            rel="noopener"
                                                            title="Open in a new tab"
                                                            className="inline-flex items-center gap-1 rounded font-mono text-sm font-semibold text-emerald-700 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50 dark:text-emerald-400"
                                                        >
                                                            {entry.control_no}
                                                            <ExternalLink className="size-3" aria-hidden="true" />
                                                        </a>
                                                        {entry.is_bundle && (
                                                            <div className="mt-1.5">
                                                                <Tag>Bundle</Tag>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    {isVisible('subject') && (
                                                        <TableCell className="max-w-md min-w-64 align-top whitespace-normal">
                                                            {entry.classification && <p className="text-sm font-medium">{entry.classification}</p>}
                                                            <p
                                                                className={cn(
                                                                    'text-sm text-muted-foreground',
                                                                    preferences.dense ? 'line-clamp-1' : 'line-clamp-2',
                                                                )}
                                                                title={entry.subject}
                                                            >
                                                                {entry.subject}
                                                            </p>
                                                        </TableCell>
                                                    )}
                                                    {isVisible('to') && (
                                                        <TableCell className="max-w-56 align-top text-sm whitespace-normal">
                                                            {entry.to.name ?? entry.to.code ?? <span className="text-muted-foreground">—</span>}
                                                        </TableCell>
                                                    )}
                                                    {isVisible('forwarded') && (
                                                        <TableCell className="align-top text-sm whitespace-nowrap">
                                                            {entry.forwarded_at ? (
                                                                <>
                                                                    <p>{dateFormat.format(new Date(entry.forwarded_at))}</p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {timeFormat.format(new Date(entry.forwarded_at))}
                                                                    </p>
                                                                </>
                                                            ) : (
                                                                '—'
                                                            )}
                                                        </TableCell>
                                                    )}
                                                    {isVisible('receipt') && (
                                                        <TableCell className="min-w-40 pr-4 align-top text-sm whitespace-normal">
                                                            <ReceiptBadge receipt={entry.receipt} />
                                                            {entry.receipt === 'received' && entry.received_at && (
                                                                <p className="mt-1 text-xs text-muted-foreground">
                                                                    {stamp(entry.received_at)}
                                                                    {entry.received_by && <span className="block text-foreground/80">{entry.received_by}</span>}
                                                                </p>
                                                            )}
                                                            {entry.receipt === 'returned' && entry.returned_at && (
                                                                <p className="mt-1 text-xs text-muted-foreground">{stamp(entry.returned_at)}</p>
                                                            )}
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </LoadingBody>

                            <Pagination page={entries} only={RELOAD} />
                        </>
                    )}
                </Deferred>
            </div>
        </AppLayout>
    );
}

const documentUrl = (controlNo: string) => `/document/view/${encodeURIComponent(controlNo)}`;

const RECEIPT_STYLES: Record<Entry['receipt'], { label: string; className: string; icon: ReactNode }> = {
    received: {
        label: 'Received',
        className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
        icon: <Check className="size-3" strokeWidth={3} aria-hidden="true" />,
    },
    returned: {
        label: 'Returned',
        className: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
        icon: <Undo2 className="size-3" aria-hidden="true" />,
    },
    awaiting: {
        label: 'Awaiting',
        className: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300',
        icon: (
            <span className="relative flex size-2" aria-hidden="true">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-sky-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-sky-500" />
            </span>
        ),
    },
};

function ReceiptBadge({ receipt }: { receipt: Entry['receipt'] }) {
    const style = RECEIPT_STYLES[receipt];

    return (
        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap', style.className)}>
            {style.icon}
            {style.label}
        </span>
    );
}

function Tag({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <span className={cn('inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground', className)}>
            {children}
        </span>
    );
}
