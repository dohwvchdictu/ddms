import { Deferred, Head, router } from '@inertiajs/react';
import { CircleCheckBig, ExternalLink, History, Hourglass, Loader2, Send, UserRoundCheck } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import BulkActionButton from '@/components/data-table/bulk-action-button';
import { LoadFailed, LoadingBody, TableSkeleton } from '@/components/data-table/deferred-states';
import DateRangeFilter, { describeRange, isSameRange, rangeQuery, type DateRangeValue } from '@/components/data-table/date-range-filter';
import FilterChips, { type FilterChip } from '@/components/data-table/filter-chips';
import ListTabs from '@/components/data-table/list-tabs';
import OutsideRangeNotice from '@/components/data-table/outside-range-notice';
import Segmented from '@/components/data-table/segmented';
import SelectionBar from '@/components/data-table/selection-bar';
import SortableHead from '@/components/data-table/sortable-head';
import ViewOptions from '@/components/data-table/view-options';
import ForwardDialog from '@/components/my-documents/forward-dialog';
import SelectionDialog from '@/components/my-documents/selection-dialog';
import type { Office } from '@/components/my-documents/types';
import CloseDialog from '@/components/pending/close-dialog';
import EndorseDialog from '@/components/pending/endorse-dialog';
import Pagination from '@/components/pagination';
import SearchInput from '@/components/search-input';
import StatusBadge from '@/components/status-badge';
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
import { cn } from '@/lib/utils';
import { pending } from '@/routes';
import { forward as forwardRoute, selectable as selectableRoute } from '@/routes/pending';
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
    /** The office that sent it here. */
    from: { code: string | null; name: string | null } | null;
    /** Its last step here: received, or endorsed since. */
    since: string | null;
    endorsed_to: string | null;
    endorsed_to_me: boolean;
}

interface Filters {
    type: DocumentType;
    search: string;
    /** "me": only what is endorsed to me. */
    endorsed: 'me' | null;
    from: string | null;
    to: string | null;
    sort: string;
    per_page: number;
    [key: string]: unknown;
}

interface Props {
    /** Deferred: undefined until it arrives after the page opens. */
    documents?: Paginated<Row>;
    filters: Filters;
    facets?: { types: Record<DocumentType, number>; endorsed: { me: number } };
    /** The last 30 days: what the list shows with no dates in the URL. */
    defaultRange: DateRangeValue;
    /** Rows hidden only by the date range; shown as a notice so the list and the sidebar badge add up. */
    outsideRange?: number;
    perPageOptions: number[];
    maxSelection: number;
    offices: Office[];
    closePasswordThreshold: number;
}

/** Reloaded by name on filter changes, page turns and actions, so the old rows stay up meanwhile. */
const RELOAD = ['filters', 'documents', 'facets', 'outsideRange'];

/** After Forward, Endorse or Close: the list in place, and the sidebar badges. */
const ACTION_RELOAD = [...RELOAD, 'sidebarCounts'];

const DEFAULT_SORT = 'updated_at';
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
    { id: 'from', label: 'From' },
    { id: 'since', label: 'Since' },
    { id: 'endorsed_to', label: 'Endorsed to' },
];

const dateFormat = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

/** "3 days ago", "2 hours ago": how long it has been waiting. */
function waited(iso: string): string {
    const minutes = Math.round((new Date(iso).getTime() - Date.now()) / 60000);

    if (Math.abs(minutes) < 60) return relative.format(minutes, 'minute');
    if (Math.abs(minutes) < 60 * 24) return relative.format(Math.round(minutes / 60), 'hour');

    return relative.format(Math.round(minutes / (60 * 24)), 'day');
}

const toQuery = (filters: Filters, defaultRange: DateRangeValue) => ({
    type: filters.type === 'all' ? undefined : filters.type,
    search: filters.search.trim() || undefined,
    endorsed: filters.endorsed ?? undefined,
    ...rangeQuery(filters, defaultRange),
    sort: filters.sort === DEFAULT_SORT ? undefined : filters.sort,
    per_page: filters.per_page === DEFAULT_PER_PAGE ? undefined : filters.per_page,
});

/** The page where a pending document is acted on. */
const pendingUrl = (controlNo: string) => `/document/pending/${encodeURIComponent(controlNo)}`;

export default function Pending({
    documents,
    filters: initial,
    facets,
    defaultRange,
    outsideRange,
    perPageOptions,
    maxSelection,
    offices,
    closePasswordThreshold,
}: Props) {
    const toUrl = (filters: Filters) => pending.url({ query: toQuery(filters, defaultRange) });
    const { filters, update, loading } = useListFilters(initial, toUrl, { debounce: ['search'], only: RELOAD });
    const { preferences, isVisible, toggleColumn, setDense } = useTablePreferences('pending');
    const [tracking, setTracking] = useState<Row | null>(null);
    const [reviewing, setReviewing] = useState(false);
    const [forwarding, setForwarding] = useState(false);
    const [endorsing, setEndorsing] = useState(false);
    const [closing, setClosing] = useState(false);
    const [selectingAll, setSelectingAll] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const selection = useSelection<Row>(maxSelection);
    const selecting = selection.size > 0 && !showFilters;

    if (selection.size === 0 && showFilters) {
        setShowFilters(false);
    }

    const chips: FilterChip[] = [
        filters.search && { key: 'search', label: 'Search', value: `“${filters.search}”`, onRemove: () => update({ search: '' }) },
        filters.endorsed && {
            key: 'endorsed',
            label: 'Endorsed',
            value: 'To me',
            onRemove: () => update({ endorsed: null }),
        },
        !isSameRange(filters, defaultRange) && { key: 'since', label: 'Since', value: describeRange(filters), onRemove: () => update({ ...defaultRange }) },
    ].filter((chip): chip is FilterChip => Boolean(chip));

    const reset = () => update({ search: '', endorsed: null, ...defaultRange });

    // Every row here can be acted on, so every row gets a checkbox.
    const pageRows = documents?.data ?? [];
    const pageChecked = pageRows.length > 0 && pageRows.every((row) => selection.has(row.id));
    const pagePartly = !pageChecked && pageRows.some((row) => selection.has(row.id));
    const morePages = documents !== undefined && documents.total > pageRows.length;
    const togglePage = (on: boolean) => (on ? selection.add(pageRows) : selection.remove(pageRows.map((row) => row.id)));

    const selectAllMatching = async () => {
        setSelectingAll(true);

        try {
            const { rows, total } = await getJson<{ rows: Row[]; total: number }>(selectableRoute.url({ query: toQuery(filters, defaultRange) }));
            selection.add(rows);

            if (total > rows.length) {
                toast.warning(`Selected the first ${maxSelection}`, { description: `${total} match; one batch can hold up to ${maxSelection}.` });
            }
        } catch {
            toast.error('Could not select all matching documents. Please try again.');
        } finally {
            setSelectingAll(false);
        }
    };

    const selectedIds = selection.items.map((row) => row.id);

    const count = selection.size;
    const columnCount = 3 + COLUMNS.filter((column) => isVisible(column.id)).length;
    const emptyKind = TYPE_TABS.find((tab) => tab.value === filters.type)?.empty ?? 'documents';

    return (
        <AppLayout title="Pending">
            <Head title="Pending" />

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
                    label="Document type"
                    value={filters.type}
                    onChange={(type) => update({ type: type as DocumentType })}
                    tabs={TYPE_TABS.map((tab) => ({ ...tab, count: facets?.types[tab.value] }))}
                />

                {selecting ? (
                    <SelectionBar count={count} onClear={selection.clear} onReview={() => setReviewing(true)} onShowFilters={() => setShowFilters(true)}>
                        <BulkActionButton icon={CircleCheckBig} label="Close" shortcut="c" onClick={() => setClosing(true)} />
                        <BulkActionButton icon={UserRoundCheck} label="Endorse" shortcut="e" onClick={() => setEndorsing(true)} />
                        <BulkActionButton icon={Send} label="Forward" shortcut="f" variant="primary" onClick={() => setForwarding(true)} />
                    </SelectionBar>
                ) : (
                    <>
                        <div className="flex min-h-15 flex-wrap items-center gap-2 border-b p-3">
                            <SearchInput
                                value={filters.search}
                                onChange={(search) => update({ search })}
                                placeholder="Search subject or control no.…"
                                label="Search pending documents"
                                loading={loading}
                                resultCount={documents && filters.search.trim() === initial.search ? documents.total : undefined}
                                className="w-full sm:max-w-md sm:min-w-72 sm:flex-1"
                            />
                            <Segmented
                                label="Endorsed"
                                value={filters.endorsed ?? 'all'}
                                onChange={(value) => update({ endorsed: value === 'me' ? 'me' : null })}
                                options={[
                                    { value: 'all', label: 'Anyone' },
                                    { value: 'me', label: 'To me', count: facets?.endorsed.me },
                                ]}
                            />
                            <DateRangeFilter label="Since" value={{ from: filters.from, to: filters.to }} onChange={({ from, to }) => update({ from, to })} />
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
                        <OutsideRangeNotice count={outsideRange ?? 0} kind={emptyKind} onShowAll={() => update({ from: null, to: null })} />
                    </>
                )}

                <Deferred data="documents" fallback={<TableSkeleton columns={4} />} rescue={<LoadFailed only={RELOAD} what="the pending documents" />}>
                    {documents && (
                        <>
                            <LoadingBody loading={loading}>
                                {documents.data.length === 0 ? (
                                    <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
                                        <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                            <Hourglass className="size-5" />
                                        </div>
                                        <p className="text-sm font-medium">
                                            {chips.length > 0 ? `No ${emptyKind} match these filters` : `No ${emptyKind} on process in the last 30 days`}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {chips.length > 0 ? 'Try fewer filters.' : 'Older ones show under a wider date range.'}
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
                                                <TableHead className="w-10 pl-4">
                                                    <Checkbox
                                                        checked={pageChecked ? true : pagePartly ? 'indeterminate' : false}
                                                        onCheckedChange={(checked) => togglePage(checked === true)}
                                                        disabled={selection.full && !pageChecked && !pagePartly}
                                                        aria-label="Select every document on this page"
                                                        className={CHECKBOX}
                                                    />
                                                </TableHead>
                                                <SortableHead column="control_no" sort={filters.sort} onSort={(sort) => update({ sort })}>
                                                    Control no.
                                                </SortableHead>
                                                {isVisible('subject') && <TableHead>Subject</TableHead>}
                                                {isVisible('from') && <TableHead>From</TableHead>}
                                                {isVisible('since') && (
                                                    <SortableHead column="updated_at" sort={filters.sort} onSort={(sort) => update({ sort })}>
                                                        Since
                                                    </SortableHead>
                                                )}
                                                {isVisible('endorsed_to') && <TableHead>Endorsed to</TableHead>}
                                                <TableHead className="pr-4 text-right">
                                                    <span className="sr-only">Actions</span>
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {pageChecked && morePages && (
                                                <TableRow className="bg-emerald-50 hover:bg-emerald-50 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/30">
                                                    <TableCell colSpan={columnCount} className="py-2 text-center text-sm">
                                                        All {documents.data.length} on this page are selected.{' '}
                                                        <button
                                                            type="button"
                                                            onClick={selectAllMatching}
                                                            disabled={selectingAll || selection.full}
                                                            className="inline-flex items-center gap-1 font-medium text-emerald-700 underline-offset-2 hover:underline disabled:opacity-50 dark:text-emerald-400"
                                                        >
                                                            {selectingAll && <Loader2 className="size-3.5 animate-spin" />}
                                                            Select all {documents.total}
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
                                                        <Checkbox
                                                            checked={selection.has(row.id)}
                                                            onCheckedChange={(checked) => selection.toggle(row, checked === true)}
                                                            disabled={selection.full && !selection.has(row.id)}
                                                            aria-label={`Select ${row.control_no}`}
                                                            className={cn(CHECKBOX, 'mt-0.5')}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="align-top">
                                                        <a
                                                            href={pendingUrl(row.control_no)}
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
                                                            {row.is_bundle && <Tag>Bundle</Tag>}
                                                        </div>
                                                    </TableCell>
                                                    {isVisible('subject') && (
                                                        <TableCell className="max-w-md min-w-64 align-top whitespace-normal">
                                                            <p className="text-sm font-medium">{row.classification}</p>
                                                            <p
                                                                className={cn(
                                                                    'text-sm text-muted-foreground',
                                                                    preferences.dense ? 'line-clamp-1' : 'line-clamp-2',
                                                                )}
                                                                title={row.subject}
                                                            >
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
                                                    {isVisible('from') && (
                                                        <TableCell className="max-w-48 align-top text-sm whitespace-normal">
                                                            {row.from?.name ?? row.from?.code ?? <span className="text-muted-foreground">—</span>}
                                                        </TableCell>
                                                    )}
                                                    {isVisible('since') && (
                                                        <TableCell className="align-top text-sm whitespace-nowrap">
                                                            {row.since ? (
                                                                <>
                                                                    <p>{dateFormat.format(new Date(row.since))}</p>
                                                                    <p className="text-xs text-muted-foreground">{waited(row.since)}</p>
                                                                </>
                                                            ) : (
                                                                '—'
                                                            )}
                                                        </TableCell>
                                                    )}
                                                    {isVisible('endorsed_to') && (
                                                        <TableCell className="max-w-44 min-w-32 align-top text-sm whitespace-normal wrap-break-word">
                                                            {row.endorsed_to ? (
                                                                <>
                                                                    {row.endorsed_to}
                                                                    {row.endorsed_to_me && <Tag className="ml-1.5 bg-emerald-600 text-white">You</Tag>}
                                                                </>
                                                            ) : (
                                                                <span className="text-muted-foreground">—</span>
                                                            )}
                                                        </TableCell>
                                                    )}
                                                    <TableCell className="pr-4 align-top">
                                                        <div className="flex justify-end">
                                                            <div
                                                                role="group"
                                                                aria-label={`Actions for ${row.control_no}`}
                                                                className="inline-flex divide-x overflow-hidden rounded-md border bg-background shadow-xs"
                                                            >
                                                                <IconAction label="Routing history" onClick={() => setTracking(row)}>
                                                                    <History />
                                                                </IconAction>
                                                                <IconAction label="Open document" href={pendingUrl(row.control_no)}>
                                                                    <ExternalLink />
                                                                </IconAction>
                                                            </div>
                                                        </div>
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
            <SelectionDialog
                open={reviewing}
                onOpenChange={setReviewing}
                items={selection.items}
                onRemove={(id) => selection.remove([id])}
                onClear={selection.clear}
            />
            <ForwardDialog
                open={forwarding}
                onOpenChange={setForwarding}
                documents={selection.items}
                offices={offices}
                onForwarded={selection.clear}
                action={forwardRoute()}
                reloadOnly={ACTION_RELOAD}
            />
            <EndorseDialog open={endorsing} onOpenChange={setEndorsing} documentIds={selectedIds} onDone={selection.clear} reloadOnly={ACTION_RELOAD} />
            <CloseDialog
                open={closing}
                onOpenChange={setClosing}
                documents={selection.items}
                passwordThreshold={closePasswordThreshold}
                onDone={selection.clear}
                reloadOnly={ACTION_RELOAD}
            />
        </AppLayout>
    );
}

const CHECKBOX =
    'data-[state=checked]:border-emerald-600 data-[state=checked]:bg-emerald-600 data-[state=indeterminate]:border-emerald-600 data-[state=indeterminate]:bg-emerald-600 data-[state=indeterminate]:text-white';

/** One icon button in a row's action group; links open in a new tab. */
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

/** A small one-of-several switch for the toolbar, with optional counts. */
function Tag({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <span className={cn('inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground', className)}>
            {children}
        </span>
    );
}
