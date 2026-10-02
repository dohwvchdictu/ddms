import { Head } from '@inertiajs/react';
import { CircleCheckBig, ExternalLink } from 'lucide-react';
import type { ReactNode } from 'react';
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
import { closed } from '@/routes';
import type { Paginated } from '@/types';

type DocumentType = 'all' | 'documents' | 'purchase_requests' | 'payments';

interface Row {
    id: number;
    control_no: string;
    subject: string;
    classification: string;
    charter: string | null;
    source: string;
    status: string;
    is_bundle: boolean;
    closed_at: string | null;
    closed_by: string | null;
    /** How it was acted upon, as typed when closing. */
    remarks: string | null;
    /** Working days from creation to close. */
    turnaround: number | null;
}

interface Filters {
    type: DocumentType;
    search: string;
    from: string | null;
    to: string | null;
    sort: string;
    per_page: number;
    [key: string]: unknown;
}

interface Props {
    documents: Paginated<Row>;
    filters: Filters;
    facets: { types: Record<DocumentType, number> };
    /** The last 30 days: what the list shows with no dates in the URL. */
    defaultRange: DateRangeValue;
    perPageOptions: number[];
}

const DEFAULT_SORT = '-closed_at';
const DEFAULT_PER_PAGE = 25;

const TYPE_TABS: { value: DocumentType; label: string; empty: string }[] = [
    { value: 'all', label: 'All', empty: 'documents' },
    { value: 'documents', label: 'Documents', empty: 'documents' },
    { value: 'purchase_requests', label: 'Purchase Requests', empty: 'purchase requests' },
    { value: 'payments', label: 'Payments', empty: 'payments' },
];

/** Columns View options can hide; Control no. always shows. */
const COLUMNS = [
    { id: 'subject', label: 'Subject' },
    { id: 'remarks', label: 'Remarks' },
    { id: 'closed', label: 'Closed' },
    { id: 'closed_by', label: 'Closed by' },
    { id: 'turnaround', label: 'Turnaround' },
];

const dateFormat = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
const timeFormat = new Intl.DateTimeFormat('en-PH', { hour: 'numeric', minute: '2-digit' });

const toQuery = (filters: Filters, defaultRange: DateRangeValue) => ({
    type: filters.type === 'all' ? undefined : filters.type,
    search: filters.search.trim() || undefined,
    ...rangeQuery(filters, defaultRange),
    sort: filters.sort === DEFAULT_SORT ? undefined : filters.sort,
    per_page: filters.per_page === DEFAULT_PER_PAGE ? undefined : filters.per_page,
});

const documentUrl = (controlNo: string) => `/document/view/${encodeURIComponent(controlNo)}`;

export default function Closed({ documents, filters: initial, facets, defaultRange, perPageOptions }: Props) {
    const toUrl = (filters: Filters) => closed.url({ query: toQuery(filters, defaultRange) });
    const { filters, update, loading } = useListFilters(initial, toUrl, { debounce: ['search'] });
    const { preferences, isVisible, toggleColumn, setDense } = useTablePreferences('closed');

    const chips: FilterChip[] = [
        filters.search && { key: 'search', label: 'Search', value: `“${filters.search}”`, onRemove: () => update({ search: '' }) },
        !isSameRange(filters, defaultRange) && { key: 'closed', label: 'Closed', value: describeRange(filters), onRemove: () => update({ ...defaultRange }) },
    ].filter((chip): chip is FilterChip => Boolean(chip));

    const reset = () => update({ search: '', ...defaultRange });
    const emptyKind = TYPE_TABS.find((tab) => tab.value === filters.type)?.empty ?? 'documents';

    return (
        <AppLayout title="Closed">
            <Head title="Closed" />

            <div className="relative overflow-clip rounded-xl border bg-card shadow-sm">
                {loading && (
                    <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-emerald-100 dark:bg-emerald-950" role="progressbar" aria-label="Loading">
                        <div className="h-full w-1/3 animate-[table-progress_1s_ease-in-out_infinite] bg-emerald-600" />
                    </div>
                )}

                <ListTabs
                    label="Document type"
                    value={filters.type}
                    onChange={(type) => update({ type: type as DocumentType })}
                    tabs={TYPE_TABS.map((tab) => ({ ...tab, count: facets.types[tab.value] }))}
                />

                <div className="flex min-h-15 flex-wrap items-center gap-2 border-b p-3">
                    <SearchInput
                        value={filters.search}
                        onChange={(search) => update({ search })}
                        placeholder="Search subject or control no.…"
                        label="Search closed documents"
                        loading={loading}
                        resultCount={filters.search.trim() === initial.search ? documents.total : undefined}
                        className="w-full sm:max-w-md sm:min-w-72 sm:flex-1"
                    />
                    <DateRangeFilter label="Closed" value={{ from: filters.from, to: filters.to }} onChange={({ from, to }) => update({ from, to })} />
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

                <div className={cn('transition-opacity', loading && 'pointer-events-none opacity-60')} aria-busy={loading}>
                    {documents.data.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
                            <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                <CircleCheckBig className="size-5" />
                            </div>
                            <p className="text-sm font-medium">{chips.length > 0 ? `No ${emptyKind} match these filters` : `No ${emptyKind} closed in the last 30 days`}</p>
                            <p className="text-sm text-muted-foreground">{chips.length > 0 ? 'Try fewer filters.' : 'Older ones show under a wider date range.'}</p>
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
                                    <SortableHead column="control_no" sort={filters.sort} onSort={(sort) => update({ sort })} className="pl-4">
                                        Control no.
                                    </SortableHead>
                                    {isVisible('subject') && <TableHead>Subject</TableHead>}
                                    {isVisible('remarks') && <TableHead>Remarks</TableHead>}
                                    {isVisible('closed') && (
                                        <SortableHead column="closed_at" sort={filters.sort} onSort={(sort) => update({ sort })}>
                                            Closed
                                        </SortableHead>
                                    )}
                                    {isVisible('closed_by') && <TableHead>Closed by</TableHead>}
                                    {isVisible('turnaround') && <TableHead className="pr-4 text-right">Turnaround</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documents.data.map((row) => (
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
                                            {row.is_bundle && (
                                                <div className="mt-1.5">
                                                    <Tag>Bundle</Tag>
                                                </div>
                                            )}
                                        </TableCell>
                                        {isVisible('subject') && (
                                            <TableCell className="max-w-md min-w-64 align-top whitespace-normal">
                                                <p className="text-sm font-medium">{row.classification}</p>
                                                <p className={cn('text-sm text-muted-foreground', preferences.dense ? 'line-clamp-1' : 'line-clamp-2')} title={row.subject}>
                                                    {row.subject}
                                                </p>
                                                {!preferences.dense && (
                                                    <div className="mt-1.5 flex flex-wrap gap-1">
                                                        <Tag
                                                            className={
                                                                row.source === 'internal'
                                                                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
                                                                    : 'bg-rose-50 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300'
                                                            }
                                                        >
                                                            <span className="capitalize">{row.source}</span>
                                                        </Tag>
                                                        {row.charter && <Tag>{row.charter}</Tag>}
                                                    </div>
                                                )}
                                            </TableCell>
                                        )}
                                        {isVisible('remarks') && (
                                            <TableCell className="max-w-64 min-w-40 align-top text-sm whitespace-normal">
                                                {row.remarks ? (
                                                    <p className={cn(preferences.dense ? 'line-clamp-1' : 'line-clamp-3')} title={row.remarks}>
                                                        {row.remarks}
                                                    </p>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                        )}
                                        {isVisible('closed') && (
                                            <TableCell className="align-top text-sm whitespace-nowrap">
                                                {row.closed_at ? (
                                                    <>
                                                        <p>{dateFormat.format(new Date(row.closed_at))}</p>
                                                        <p className="text-xs text-muted-foreground">{timeFormat.format(new Date(row.closed_at))}</p>
                                                    </>
                                                ) : (
                                                    '—'
                                                )}
                                            </TableCell>
                                        )}
                                        {isVisible('closed_by') && (
                                            <TableCell className="max-w-44 min-w-32 align-top text-sm whitespace-normal wrap-break-word">
                                                {row.closed_by ?? <span className="text-muted-foreground">—</span>}
                                            </TableCell>
                                        )}
                                        {isVisible('turnaround') && (
                                            <TableCell className="pr-4 align-top text-right text-sm whitespace-nowrap tabular-nums">
                                                {row.turnaround !== null ? `${row.turnaround} ${row.turnaround === 1 ? 'day' : 'days'}` : <span className="text-muted-foreground">—</span>}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                <Pagination page={documents} />
            </div>

        </AppLayout>
    );
}

function Tag({ children, className }: { children: ReactNode; className?: string }) {
    return <span className={cn('inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground', className)}>{children}</span>;
}
