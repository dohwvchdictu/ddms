import { Head } from '@inertiajs/react';
import { Building2, CircleDot, FileSearch, Globe } from 'lucide-react';
import { useMemo, useState } from 'react';
import DateRangeFilter, { describeRange, isSameRange, rangeQuery, type DateRangeValue } from '@/components/data-table/date-range-filter';
import FacetedFilter from '@/components/data-table/faceted-filter';
import FilterChips, { type FilterChip } from '@/components/data-table/filter-chips';
import SortableHead from '@/components/data-table/sortable-head';
import StatusBadge from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useListFilters } from '@/hooks/use-list-filters';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { perUnit as perUnitReport } from '@/routes/reports';

interface Row {
    /** The procedure or category. */
    name: string;
    count: number;
}

interface Filters {
    /** Empty means any, for each of the three. */
    offices: string[];
    sources: string[];
    statuses: string[];
    from: string | null;
    to: string | null;
    [key: string]: unknown;
}

interface Props {
    filters: Filters;
    /** This year so far: what the report shows with no dates in the URL. */
    defaultRange: DateRangeValue;
    report: {
        total: number;
        /** Most documents first. */
        rows: Row[];
        /** Live counts for each filter's choices, under the other filters. */
        facets: {
            offices: Record<string, number>;
            sources: Record<string, number>;
            statuses: Record<string, number>;
        };
    };
    offices: { id: string; name: string; code: string | null }[];
    statusOptions: string[];
    sourceOptions: string[];
}

const number = new Intl.NumberFormat('en-PH');
const SOURCE_LABELS: Record<string, string> = {
    internal: 'Internal',
    external: 'External',
};
const list = (values: string[]) => (values.length ? values.join(',') : undefined);
const share = (count: number, total: number) => (total > 0 ? (count / total) * 100 : 0);

const toQuery = (filters: Filters, defaultRange: DateRangeValue) => ({
    office: list(filters.offices),
    source: list(filters.sources),
    status: list(filters.statuses),
    ...rangeQuery(filters, defaultRange),
});

export default function PerUnitReport({ filters: initial, defaultRange, report, offices, statusOptions, sourceOptions }: Props) {
    const toUrl = (filters: Filters) => perUnitReport.url({ query: toQuery(filters, defaultRange) });
    const { filters, update, loading } = useListFilters(initial, toUrl);
    const [sort, setSort] = useState('-count');

    const officeOf = (id: string) => offices.find((office) => office.id === id);

    const chips: FilterChip[] = [
        filters.offices.length > 0 && {
            key: 'office',
            label: 'Office',
            value: filters.offices.map((id) => officeOf(id)?.code ?? officeOf(id)?.name ?? id).join(', '),
            onRemove: () => update({ offices: [] }),
        },
        filters.sources.length > 0 && {
            key: 'source',
            label: 'Source',
            value: filters.sources.map((source) => SOURCE_LABELS[source]).join(', '),
            onRemove: () => update({ sources: [] }),
        },
        filters.statuses.length > 0 && {
            key: 'status',
            label: 'Status',
            value: filters.statuses.join(', '),
            onRemove: () => update({ statuses: [] }),
        },
        !isSameRange(filters, defaultRange) && {
            key: 'created',
            label: 'Created',
            value: describeRange(filters),
            onRemove: () => update({ ...defaultRange }),
        },
    ].filter((chip): chip is FilterChip => Boolean(chip));

    const reset = () => update({ offices: [], sources: [], statuses: [], ...defaultRange });

    // Ranked by size (rows come most documents first), so "#3" stays the third largest when sorted by name.
    const rows = useMemo(() => {
        const descending = sort.startsWith('-');
        const column = descending ? sort.slice(1) : sort;

        return report.rows
            .map((row, index) => ({ ...row, rank: index + 1 }))
            .sort((a, b) => {
                const order = column === 'name' ? a.name.localeCompare(b.name) : a.count - b.count || b.name.localeCompare(a.name);

                return descending ? -order : order;
            });
    }, [report.rows, sort]);

    const largest = report.rows[0]?.count ?? 0;

    return (
        <AppLayout title="Per Unit">
            <Head title="Per Unit" />

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

                {/* What is counted (the office that encoded it, its source and status, and when), and how many. */}
                <div className="flex min-h-15 flex-wrap items-center gap-2 border-b p-3">
                    <FacetedFilter
                        title="Office"
                        icon={Building2}
                        searchable
                        options={offices.map((office) => ({
                            value: office.id,
                            label: office.name,
                            count: report.facets.offices[office.id] ?? 0,
                        }))}
                        value={filters.offices}
                        onChange={(offices) => update({ offices })}
                    />
                    <FacetedFilter
                        title="Source"
                        icon={Globe}
                        options={sourceOptions.map((source) => ({
                            value: source,
                            label: SOURCE_LABELS[source] ?? source,
                            count: report.facets.sources[source] ?? 0,
                        }))}
                        value={filters.sources}
                        onChange={(sources) => update({ sources })}
                    />
                    <FacetedFilter
                        title="Status"
                        icon={CircleDot}
                        options={statusOptions.map((status) => ({
                            value: status,
                            label: status,
                            count: report.facets.statuses[status] ?? 0,
                            display: <StatusBadge status={status} />,
                        }))}
                        value={filters.statuses}
                        onChange={(statuses) => update({ statuses })}
                    />
                    <DateRangeFilter label="Created" value={{ from: filters.from, to: filters.to }} onChange={({ from, to }) => update({ from, to })} />
                    <p className={cn('ml-auto flex items-baseline gap-1.5 pr-1 transition-opacity', loading && 'opacity-60')} aria-live="polite">
                        <span className="text-lg font-semibold tabular-nums">{number.format(report.total)}</span>
                        <span className="text-sm text-muted-foreground">{report.total === 1 ? 'document' : 'documents'}</span>
                    </p>
                </div>
                <FilterChips chips={chips} onReset={reset} />

                <div className={cn('transition-opacity', loading && 'pointer-events-none opacity-60')} aria-busy={loading}>
                    {report.total === 0 ? (
                        <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
                            <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                <FileSearch className="size-5" />
                            </div>
                            <p className="text-sm font-medium">No documents match these filters</p>
                            <p className="text-sm text-muted-foreground">Try another office, status or date range.</p>
                            {chips.length > 0 && (
                                <Button variant="outline" size="sm" onClick={reset} className="mt-2">
                                    Reset filters
                                </Button>
                            )}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="w-12 pl-4 text-right">#</TableHead>
                                    <SortableHead column="name" sort={sort} onSort={setSort}>
                                        Procedure / Category
                                    </SortableHead>
                                    <SortableHead column="count" sort={sort} onSort={setSort} firstDirection="desc" className="text-right">
                                        Documents
                                    </SortableHead>
                                    <TableHead className="w-56 pr-4">Share</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow key={row.name}>
                                        <TableCell className="pl-4 text-right text-xs text-muted-foreground tabular-nums">{row.rank}</TableCell>
                                        <TableCell className="max-w-xl text-sm font-medium whitespace-normal">{row.name}</TableCell>
                                        <TableCell className="text-right font-medium tabular-nums">{number.format(row.count)}</TableCell>
                                        <TableCell className="pr-4">
                                            {/* The bar is scaled to the largest, so the leaders read at a glance; the % is of all documents. */}
                                            <div className="flex items-center gap-2">
                                                <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                                                    <span
                                                        className="block h-full rounded-full bg-emerald-500"
                                                        style={{
                                                            width: `${largest > 0 ? Math.max((row.count / largest) * 100, 2) : 0}%`,
                                                        }}
                                                    />
                                                </span>
                                                <span className="w-12 text-right text-xs text-muted-foreground tabular-nums">
                                                    {share(row.count, report.total).toFixed(1)}%
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableFooter>
                                <TableRow className="font-semibold">
                                    <TableCell />
                                    <TableCell>Total</TableCell>
                                    <TableCell className="text-right tabular-nums">{number.format(report.total)}</TableCell>
                                    <TableCell className="pr-4" />
                                </TableRow>
                            </TableFooter>
                        </Table>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
