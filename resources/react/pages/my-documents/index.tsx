import { Head } from '@inertiajs/react';
import { CircleDot, ExternalLink, FileSearch, History, Loader2, NotebookText, Printer, Send, TriangleAlert } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import DateRangeFilter, { describeRange, isSameRange, rangeQuery, type DateRangeValue } from '@/components/data-table/date-range-filter';
import FacetedFilter, { type FacetOption } from '@/components/data-table/faceted-filter';
import BulkActionButton from '@/components/data-table/bulk-action-button';
import FilterChips, { type FilterChip } from '@/components/data-table/filter-chips';
import ListTabs from '@/components/data-table/list-tabs';
import SelectionBar from '@/components/data-table/selection-bar';
import SortableHead from '@/components/data-table/sortable-head';
import ViewOptions from '@/components/data-table/view-options';
import ForwardDialog from '@/components/my-documents/forward-dialog';
import SelectionDialog from '@/components/my-documents/selection-dialog';
import type { DocumentRow as Row, Office } from '@/components/my-documents/types';
import Pagination from '@/components/pagination';
import SearchInput from '@/components/search-input';
import StatusBadge from '@/components/status-badge';
import { documentUrl } from '@/components/document-tracking';
import TrackingDialog from '@/components/tracking-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useListFilters } from '@/hooks/use-list-filters';
import { useSelection } from '@/hooks/use-selection';
import { useTablePreferences } from '@/hooks/use-table-preferences';
import AppLayout from '@/layouts/app-layout';
import { getJson } from '@/lib/fetch-json';
import { printTransmittalForm } from '@/lib/print-page';
import { cn } from '@/lib/utils';
import { myDocuments } from '@/routes';
import { generateLogbook } from '@/routes/inbox';
import { selectable as selectableRoute } from '@/routes/my-documents';
import type { Paginated } from '@/types';

type DocumentType = 'all' | 'documents' | 'purchase_requests' | 'payments';

interface Filters {
    type: DocumentType;
    search: string;
    statuses: string[];
    from: string | null;
    to: string | null;
    sort: string;
    per_page: number;
    [key: string]: unknown;
}

interface Facets {
    statuses: Record<string, number>;
    types: Record<DocumentType, number>;
}

interface Props {
    documents: Paginated<Row>;
    filters: Filters;
    facets: Facets;
    statusOptions: string[];
    /** The last 30 days: what the list shows with no dates in the URL. */
    defaultRange: DateRangeValue;
    perPageOptions: number[];
    offices: Office[];
    /** Most documents one batch may hold (the server's forward limit). */
    maxSelection: number;
}

/** The tabs, in order; `empty` names them in the "No … found" message. */
const TYPE_TABS: { value: DocumentType; label: string; empty: string }[] = [
    { value: 'all', label: 'All', empty: 'documents' },
    { value: 'documents', label: 'Documents', empty: 'documents' },
    { value: 'purchase_requests', label: 'Purchase Requests', empty: 'purchase requests' },
    { value: 'payments', label: 'Payments', empty: 'payments' },
];

const DEFAULT_SORT = '-created_at';
const DEFAULT_PER_PAGE = 25;

/** Columns View options can hide; Control no. always shows. */
const COLUMNS = [
    { id: 'subject', label: 'Subject' },
    { id: 'destination', label: 'Destination' },
    { id: 'created', label: 'Created' },
    { id: 'encoded_by', label: 'Encoded by' },
];

const dateFormat = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
const timeFormat = new Intl.DateTimeFormat('en-PH', { hour: 'numeric', minute: '2-digit' });

const list = (values: string[]) => (values.length ? values.join(',') : undefined);

/** The query for a set of filters. */
const toQuery = (filters: Filters, defaultRange: DateRangeValue) => ({
    type: filters.type === 'all' ? undefined : filters.type,
    search: filters.search.trim() || undefined,
    status: list(filters.statuses),
    ...rangeQuery(filters, defaultRange),
    sort: filters.sort === DEFAULT_SORT ? undefined : filters.sort,
    per_page: filters.per_page === DEFAULT_PER_PAGE ? undefined : filters.per_page,
});

export default function MyDocuments({ documents, filters: initial, facets, statusOptions, defaultRange, perPageOptions, offices, maxSelection }: Props) {
    const toUrl = (filters: Filters) => myDocuments.url({ query: toQuery(filters, defaultRange) });
    const { filters, update, loading } = useListFilters(initial, toUrl, { debounce: ['search'] });
    const { preferences, isVisible, toggleColumn, setDense } = useTablePreferences('my-documents');
    const [tracking, setTracking] = useState<Row | null>(null);
    const [reviewing, setReviewing] = useState(false);
    const [forwarding, setForwarding] = useState(false);
    const [selectingAll, setSelectingAll] = useState(false);
    // While something is selected the toolbar shows the selection; "Filters" swaps back to search without dropping it.
    const [showFilters, setShowFilters] = useState(false);
    const selection = useSelection<Row>(maxSelection);
    const selecting = selection.size > 0 && !showFilters;

    // Once the selection is empty, the next one starts on the selection toolbar again.
    if (selection.size === 0 && showFilters) {
        setShowFilters(false);
    }

    // Filter options, each with how many documents it would show.
    const statusFacet: FacetOption[] = statusOptions.map((status) => ({
        value: status,
        label: status,
        count: facets.statuses[status] ?? 0,
        display: <StatusBadge status={status} />,
    }));
    // The filters in effect, as removable chips. The default date range isn't one.
    const chips: FilterChip[] = [
        filters.search && { key: 'search', label: 'Search', value: `“${filters.search}”`, onRemove: () => update({ search: '' }) },
        filters.statuses.length > 0 && { key: 'status', label: 'Status', value: filters.statuses.join(', '), onRemove: () => update({ statuses: [] }) },
        !isSameRange(filters, defaultRange) && { key: 'created', label: 'Created', value: describeRange(filters), onRemove: () => update({ ...defaultRange }) },
    ].filter((chip): chip is FilterChip => Boolean(chip));

    const reset = () => update({ search: '', statuses: [], ...defaultRange });

    // Header checkbox: this page's selectable rows.
    const pageRows = documents.data.filter((row) => row.selectable);
    const pageChecked = pageRows.length > 0 && pageRows.every((row) => selection.has(row.id));
    const pagePartly = !pageChecked && pageRows.some((row) => selection.has(row.id));
    const morePages = documents.total > documents.data.length;

    // Forward needs every pick still Created; the logbook needs every pick For Receiving.
    const canForward = selection.size > 0 && selection.items.every((row) => row.status === 'Created');
    const canLogbook = selection.size > 0 && selection.items.every((row) => row.status === 'For Receiving');

    // How the selection splits by status, in workflow order.
    const breakdown = statusOptions
        .map((status) => [status, selection.items.filter((row) => row.status === status).length] as const)
        .filter(([, count]) => count > 0);
    const created = breakdown.find(([status]) => status === 'Created')?.[1] ?? 0;
    const receiving = breakdown.find(([status]) => status === 'For Receiving')?.[1] ?? 0;
    const mixed = created > 0 && receiving > 0;

    /** Drops every selected row not in this status, to fix a mixed selection in one click. */
    const keepOnly = (status: string) => selection.remove(selection.items.filter((row) => row.status !== status).map((row) => row.id));

    const togglePage = (on: boolean) => (on ? selection.add(pageRows) : selection.remove(pageRows.map((row) => row.id)));

    // "Select all matching": every selectable row under these filters, not just this page.
    const selectAllMatching = async () => {
        setSelectingAll(true);

        try {
            const { rows, total } = await getJson<{ rows: Row[]; total: number }>(selectableRoute.url({ query: toQuery(filters, defaultRange) }));
            const fresh = rows.filter((row) => !selection.has(row.id));
            const room = maxSelection - selection.size;
            selection.add(rows);

            // Capped by the server (it sends at most a batch) or by what was already picked.
            if (total > rows.length || fresh.length > room) {
                toast.warning(`Selection is full at ${maxSelection} documents`, {
                    description: `${total} match these filters; one batch can hold up to ${maxSelection}.`,
                });
            }
        } catch {
            toast.error('Could not select all matching documents. Please try again.');
        } finally {
            setSelectingAll(false);
        }
    };

    const logbookUrl = generateLogbook.url({ query: { selected_items: selection.items.map((row) => row.id).join(',') } });
    const columnCount = 3 + COLUMNS.filter((column) => isVisible(column.id)).length;

    return (
        <AppLayout title="My Documents">
            <Head title="My Documents" />

            {/* overflow-clip, not -hidden: hidden would make this the scroll box and stop the selection bar sticking. */}
            <div className="relative overflow-clip rounded-xl border bg-card shadow-sm">
                {/* Reloading: a thin bar runs along the top while the table dims. */}
                {loading && (
                    <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-emerald-100 dark:bg-emerald-950" role="progressbar" aria-label="Loading">
                        <div className="h-full w-1/3 animate-[table-progress_1s_ease-in-out_infinite] bg-emerald-600" />
                    </div>
                )}

                {/* Tabs: the kinds of document. They keep the other filters; the selection survives them too. */}
                <ListTabs
                    label="Document type"
                    value={filters.type}
                    onChange={(type) => update({ type: type as DocumentType })}
                    tabs={TYPE_TABS.map((tab) => ({ ...tab, count: facets.types[tab.value] }))}
                />

                {/* Toolbar: the filters, or (while something is selected) what to do with the selection. */}
                {selecting ? (
                    <SelectionBar
                        count={selection.size}
                        onClear={selection.clear}
                        onReview={() => setReviewing(true)}
                        // The batch can span several searches: filter on without losing it.
                        onShowFilters={() => setShowFilters(true)}
                        notice={
                            mixed && (
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                                    <span className="inline-flex items-center gap-1.5">
                                        <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
                                        Forward takes <strong className="font-semibold">Created</strong> documents and the logbook{' '}
                                        <strong className="font-semibold">For Receiving</strong> ones. Keep one kind:
                                    </span>
                                    <span className="flex flex-wrap gap-1.5">
                                        <Button size="xs" variant="outline" onClick={() => keepOnly('Created')} className="border-amber-300 bg-background">
                                            Keep the {created} Created
                                        </Button>
                                        <Button size="xs" variant="outline" onClick={() => keepOnly('For Receiving')} className="border-amber-300 bg-background">
                                            Keep the {receiving} For Receiving
                                        </Button>
                                    </span>
                                </div>
                            )
                        }
                    >
                        <BulkActionButton
                            icon={NotebookText}
                            label="Generate logbook"
                            shortcut="l"
                            href={logbookUrl}
                            newTab
                            disabled={!canLogbook}
                            disabledReason="The logbook lists documents that are For Receiving. Untick the Created ones first."
                        />
                        <BulkActionButton
                            icon={Send}
                            label="Forward"
                            shortcut="f"
                            variant="primary"
                            onClick={() => setForwarding(true)}
                            disabled={!canForward}
                            disabledReason="Only Created documents can be forwarded. Untick the For Receiving ones first."
                        />
                    </SelectionBar>
                ) : (
                    <>
                        <div className="flex min-h-15 flex-wrap items-center gap-2 border-b p-3">
                            <SearchInput
                                value={filters.search}
                                onChange={(search) => update({ search })}
                                placeholder="Search subject or control no.…"
                                label="Search my documents"
                                loading={loading}
                                // Only once the results are for what is typed, not a stale count mid-typing.
                                resultCount={filters.search.trim() === initial.search ? documents.total : undefined}
                                className="w-full sm:max-w-md sm:min-w-72 sm:flex-1"
                            />
                            <FacetedFilter title="Status" icon={CircleDot} options={statusFacet} value={filters.statuses} onChange={(statuses) => update({ statuses })} />
                            <DateRangeFilter label="Created" value={{ from: filters.from, to: filters.to }} onChange={({ from, to }) => update({ from, to })} />
                            <div className="ml-auto flex items-center gap-2">
                                {selection.size > 0 && (
                                    <Button size="sm" onClick={() => setShowFilters(false)} className="h-9 bg-emerald-600 text-white hover:bg-emerald-700">
                                        {selection.size} selected
                                    </Button>
                                )}
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
                    </>
                )}

                <div className={cn('transition-opacity', loading && 'pointer-events-none opacity-60')} aria-busy={loading}>
                    {documents.data.length === 0 ? (
                        <EmptyState filtered={chips.length > 0} onReset={reset} kind={TYPE_TABS.find((tab) => tab.value === filters.type)?.empty ?? 'documents'} />
                    ) : (
                        <Table className={cn(preferences.dense ? '[&_td]:py-1.5' : '[&_td]:py-3')}>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="w-10 pl-4">
                                        <Checkbox
                                            checked={pageChecked ? true : pagePartly ? 'indeterminate' : false}
                                            onCheckedChange={(checked) => togglePage(checked === true)}
                                            disabled={pageRows.length === 0 || (selection.full && !pageChecked && !pagePartly)}
                                            aria-label="Select every selectable document on this page"
                                            className={CHECKBOX}
                                        />
                                    </TableHead>
                                    <SortableHead column="control_no" sort={filters.sort} onSort={(sort) => update({ sort })}>
                                        Control no.
                                    </SortableHead>
                                    {isVisible('subject') && <TableHead>Subject</TableHead>}
                                    {isVisible('destination') && <TableHead>Destination</TableHead>}
                                    {isVisible('created') && (
                                        <SortableHead column="created_at" sort={filters.sort} onSort={(sort) => update({ sort })} firstDirection="desc">
                                            Created
                                        </SortableHead>
                                    )}
                                    {isVisible('encoded_by') && <TableHead>Encoded by</TableHead>}
                                    <TableHead className="pr-4 text-right">
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pageChecked && morePages && (
                                    <TableRow className="bg-emerald-50 hover:bg-emerald-50 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/30">
                                        <TableCell colSpan={columnCount} className="py-2 text-center text-sm">
                                            All selectable documents on this page are selected.{' '}
                                            <button
                                                type="button"
                                                onClick={selectAllMatching}
                                                disabled={selectingAll || selection.full}
                                                className="inline-flex items-center gap-1 font-medium text-emerald-700 underline-offset-2 hover:underline disabled:opacity-50 dark:text-emerald-400"
                                            >
                                                {selectingAll && <Loader2 className="size-3.5 animate-spin" />}
                                                Select every match on all pages
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {documents.data.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={selection.has(row.id) ? 'selected' : undefined}
                                        className="data-[state=selected]:bg-emerald-50/60 dark:data-[state=selected]:bg-emerald-950/20"
                                    >
                                        <TableCell className="pl-4 align-top">
                                            {row.selectable ? (
                                                <Checkbox
                                                    checked={selection.has(row.id)}
                                                    onCheckedChange={(checked) => selection.toggle(row, checked === true)}
                                                    disabled={selection.full && !selection.has(row.id)}
                                                    aria-label={`Select ${row.control_no}`}
                                                    className={cn(CHECKBOX, 'mt-0.5')}
                                                />
                                            ) : (
                                                // Not Created / For Receiving, or a bundle attachment (it travels with its bundle).
                                                <span className="sr-only">Not selectable</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="align-top">
                                            {/* A new tab, so the list and its filters stay where they are. */}
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
                                            <div className="mt-1.5 flex flex-wrap gap-1">
                                                <StatusBadge status={row.status} className="px-1.5 py-0 text-[0.65rem] leading-4" />
                                                {row.turnaround_days !== null && (
                                                    <Tag title="Turnaround time">
                                                        TAT {row.turnaround_days} {row.turnaround_days === 1 ? 'day' : 'days'}
                                                    </Tag>
                                                )}
                                                {row.is_bundle && <Tag>Bundle</Tag>}
                                            </div>
                                        </TableCell>
                                        {isVisible('subject') && (
                                            <TableCell className="max-w-md min-w-64 align-top whitespace-normal">
                                                <p className="text-sm font-medium">{row.classification}</p>
                                                <p className={cn('text-sm text-muted-foreground', preferences.dense ? 'line-clamp-1' : 'line-clamp-2')} title={row.subject}>
                                                    <Highlight text={row.subject} term={filters.search} />
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
                                        {isVisible('destination') && (
                                            <TableCell className="align-top text-sm">
                                                {row.destination?.code ? (
                                                    <span title={row.destination.name ?? undefined}>{row.destination.code}</span>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                        )}
                                        {isVisible('created') && (
                                            <TableCell className="align-top text-sm whitespace-nowrap">
                                                {row.created_at ? (
                                                    <>
                                                        <p>{dateFormat.format(new Date(row.created_at))}</p>
                                                        {!preferences.dense && <p className="text-xs text-muted-foreground">{timeFormat.format(new Date(row.created_at))}</p>}
                                                    </>
                                                ) : (
                                                    '—'
                                                )}
                                            </TableCell>
                                        )}
                                        {isVisible('encoded_by') && (
                                            <TableCell className="max-w-44 min-w-32 align-top text-sm whitespace-normal wrap-break-word">
                                                {row.encoded_by ?? <span className="text-muted-foreground">—</span>}
                                            </TableCell>
                                        )}
                                        <TableCell className="pr-4 align-top">
                                            <div className="flex justify-end">
                                                <RowActions row={row} onTrack={() => setTracking(row)} onPrint={() => printTransmittalForm(row.control_no)} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                <Pagination page={documents} />
            </div>

            <TrackingDialog document={tracking} onClose={() => setTracking(null)} />            <SelectionDialog
                open={reviewing}
                onOpenChange={setReviewing}
                items={selection.items}
                onRemove={(id) => selection.remove([id])}
                onClear={selection.clear}
            />
            <ForwardDialog open={forwarding} onOpenChange={setForwarding} documents={selection.items} offices={offices} onForwarded={selection.clear} />
        </AppLayout>
    );
}

const CHECKBOX = 'data-[state=checked]:border-emerald-600 data-[state=checked]:bg-emerald-600 data-[state=indeterminate]:border-emerald-600 data-[state=indeterminate]:bg-emerald-600 data-[state=indeterminate]:text-white';

/** The search term marked wherever it appears in the text. */
function Highlight({ text, term }: { text: string; term: string }) {
    const needle = term.trim();

    if (needle.length < 2) {
        return <>{text}</>;
    }

    const parts = text.split(new RegExp(`(${needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));

    return (
        <>
            {parts.map((part, index) =>
                index % 2 === 1 ? (
                    <mark key={index} className="rounded-sm bg-yellow-200/70 px-0.5 text-inherit dark:bg-yellow-500/30">
                        {part}
                    </mark>
                ) : (
                    part
                ),
            )}
        </>
    );
}

/** A row's actions as one group of icon buttons. */
function RowActions({ row, onTrack, onPrint }: { row: Row; onTrack: () => void; onPrint: () => void }) {
    return (
        <div role="group" aria-label={`Actions for ${row.control_no}`} className="inline-flex divide-x overflow-hidden rounded-md border bg-background shadow-xs">
            <IconAction label="Routing history" onClick={onTrack}>
                <History />
            </IconAction>
            <IconAction label="Open document" href={documentUrl(row.control_no)}>
                <ExternalLink />
            </IconAction>
            {row.can_print && (
                <IconAction label="Print transmittal form" onClick={onPrint}>
                    <Printer />
                </IconAction>
            )}
        </div>
    );
}

/** One button in the group: an icon, named by its tooltip. Links open in a new tab. */
function IconAction({ label, onClick, href, children }: { label: string; onClick?: () => void; href?: string; children: ReactNode }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" onClick={onClick} asChild={!!href} aria-label={label} className="rounded-none">
                    {href ? (
                        <a href={href} target="_blank" rel="noopener">
                            {children}
                        </a>
                    ) : (
                        children
                    )}
                </Button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );
}

function Tag({ children, className, title }: { children: ReactNode; className?: string; title?: string }) {
    return (
        <span title={title} className={cn('inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground', className)}>
            {children}
        </span>
    );
}

function EmptyState({ filtered, onReset, kind }: { filtered: boolean; onReset: () => void; kind: string }) {
    return (
        <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <FileSearch className="size-5" />
            </div>
            <p className="text-sm font-medium">No {kind} found</p>
            <p className="text-sm text-muted-foreground">
                {filtered ? 'Nothing matches these filters.' : 'Nothing was encoded in the last 30 days. Try a wider date range.'}
            </p>
            {filtered && (
                <Button variant="outline" size="sm" onClick={onReset} className="mt-2">
                    Reset filters
                </Button>
            )}
        </div>
    );
}
