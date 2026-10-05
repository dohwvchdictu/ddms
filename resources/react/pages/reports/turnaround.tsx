import { Head } from '@inertiajs/react';
import { Building2, ChevronRight, Gauge, Globe, Loader2, Rabbit, Snail, Timer } from 'lucide-react';
import { Fragment, useMemo, useState } from 'react';
import DateRangeFilter, { describeRange, isSameRange, rangeQuery, type DateRangeValue } from '@/components/data-table/date-range-filter';
import FacetedFilter from '@/components/data-table/faceted-filter';
import FilterChips, { type FilterChip } from '@/components/data-table/filter-chips';
import SortableHead from '@/components/data-table/sortable-head';
import StatCard from '@/components/reports/stat-card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useListFilters } from '@/hooks/use-list-filters';
import AppLayout from '@/layouts/app-layout';
import { getJson } from '@/lib/fetch-json';
import { cn } from '@/lib/utils';
import { turnaround as turnaroundReport } from '@/routes/reports';
import { office as officeDetail } from '@/routes/reports/turnaround';

interface Dwell {
    /** Completed hops: times a document was received here and then forwarded or closed. */
    hops: number;
    /** Working days, to one decimal; null when nothing was measured. */
    avg: number | null;
    min: number | null;
    max: number | null;
}

interface OfficeRow extends Dwell {
    id: number;
    name: string;
}

interface Detail {
    hops: number;
    categories: (Dwell & { name: string })[];
}

interface Filters {
    offices: string[];
    sources: string[];
    from: string | null;
    to: string | null;
    [key: string]: unknown;
}

interface Props {
    filters: Filters;
    /** The last 30 days: what the report shows with no dates in the URL. */
    defaultRange: DateRangeValue;
    report: {
        summary: { documents: number; total: number; average: number | null; fastest: number | null; slowest: number | null };
        offices: OfficeRow[];
        facets: { offices: Record<string, number> };
    };
    offices: { id: string; name: string }[];
    sourceOptions: string[];
}

type Column = 'name' | 'avg' | 'min' | 'max';

const SOURCE_LABELS: Record<string, string> = { internal: 'Internal', external: 'External' };
const list = (values: string[]) => (values.length ? values.join(',') : undefined);
const days = (value: number | null, digits = 0) => (value === null ? '—' : `${value.toFixed(digits)} ${value === 1 ? 'day' : 'days'}`);

const toQuery = (filters: Filters, defaultRange: DateRangeValue) => ({
    office: list(filters.offices),
    source: list(filters.sources),
    ...rangeQuery(filters, defaultRange),
});

export default function TurnaroundReport({ filters: initial, defaultRange, report, offices, sourceOptions }: Props) {
    const toUrl = (filters: Filters) => turnaroundReport.url({ query: toQuery(filters, defaultRange) });
    const { filters, update, loading } = useListFilters(initial, toUrl);
    const [sort, setSort] = useState('-avg');
    // One office open at a time; its breakdown is fetched once per set of filters.
    const [expanded, setExpanded] = useState<number | null>(null);
    const [details, setDetails] = useState<Record<string, Detail | 'loading' | 'error'>>({});

    const officeName = (id: string) => offices.find((office) => office.id === id)?.name ?? id;

    const chips: FilterChip[] = [
        filters.offices.length > 0 && { key: 'office', label: 'Office', value: filters.offices.map(officeName).join(', '), onRemove: () => update({ offices: [] }) },
        filters.sources.length > 0 && { key: 'source', label: 'Source', value: filters.sources.map((source) => SOURCE_LABELS[source]).join(', '), onRemove: () => update({ sources: [] }) },
        !isSameRange(filters, defaultRange) && { key: 'created', label: 'Created', value: describeRange(filters), onRemove: () => update({ ...defaultRange }) },
    ].filter((chip): chip is FilterChip => Boolean(chip));

    const reset = () => update({ offices: [], sources: [], ...defaultRange });

    const rows = useMemo(() => {
        const descending = sort.startsWith('-');
        const column = (descending ? sort.slice(1) : sort) as Column;

        return [...report.offices].sort((a, b) => {
            const order = column === 'name' ? a.name.localeCompare(b.name) : (a[column] ?? -1) - (b[column] ?? -1) || b.hops - a.hops;

            return descending ? -order : order;
        });
    }, [report.offices, sort]);

    // The breakdown depends on the source and dates, not on which offices are picked.
    const detailKey = (id: number) => `${id}|${list(filters.sources) ?? ''}|${initial.from ?? ''}|${initial.to ?? ''}`;

    const toggle = (row: OfficeRow) => {
        if (expanded === row.id) {
            setExpanded(null);
            return;
        }

        setExpanded(row.id);
        const key = detailKey(row.id);

        if (details[key] && details[key] !== 'error') return;

        setDetails((current) => ({ ...current, [key]: 'loading' }));
        getJson<Detail>(officeDetail.url(row.id, { query: { source: list(initial.sources), ...rangeQuery(initial, defaultRange) } }))
            .then((detail) => setDetails((current) => ({ ...current, [key]: detail })))
            .catch(() => setDetails((current) => ({ ...current, [key]: 'error' })));
    };

    const head = (column: Column, label: string, className?: string) => (
        <SortableHead column={column} sort={sort} onSort={setSort} firstDirection={column === 'name' ? 'asc' : 'desc'} className={className}>
            {label}
        </SortableHead>
    );

    return (
        <AppLayout title="Turnaround Time">
            <Head title="Turnaround Time" />

            <div className="grid gap-4">
                <div className={cn('grid gap-3 transition-opacity sm:grid-cols-3', loading && 'opacity-60')}>
                    <StatCard
                        label="Average turnaround"
                        value={days(report.summary.average, 1)}
                        icon={Gauge}
                        tile="bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300"
                        tooltip="Working days an office keeps a document on average: from receiving it to forwarding or closing it. Weekends are not counted."
                    />
                    <StatCard
                        label="Fastest"
                        value={days(report.summary.fastest)}
                        icon={Rabbit}
                        tile="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                        tooltip="The shortest time any office kept a document. A document finished the day it arrived counts as 1 day."
                    />
                    <StatCard
                        label="Slowest"
                        value={days(report.summary.slowest)}
                        icon={Snail}
                        tile="bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
                        tooltip="The longest time any office kept a document."
                    />
                </div>

                <div className="relative overflow-clip rounded-xl border bg-card shadow-sm">
                    {loading && (
                        <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-emerald-100 dark:bg-emerald-950" role="progressbar" aria-label="Loading">
                            <div className="h-full w-1/3 animate-[table-progress_1s_ease-in-out_infinite] bg-emerald-600" />
                        </div>
                    )}

                    {/* Which documents are measured (source, created when) and which offices are shown. */}
                    <div className="flex min-h-15 flex-wrap items-center gap-2 border-b p-3">
                        <FacetedFilter
                            title="Office"
                            icon={Building2}
                            searchable
                            options={offices.map((office) => ({ value: office.id, label: office.name, count: report.facets.offices[office.id] ?? 0 }))}
                            value={filters.offices}
                            onChange={(offices) => update({ offices })}
                        />
                        <FacetedFilter
                            title="Source"
                            icon={Globe}
                            options={sourceOptions.map((source) => ({ value: source, label: SOURCE_LABELS[source] ?? source }))}
                            value={filters.sources}
                            onChange={(sources) => update({ sources })}
                        />
                        <DateRangeFilter label="Created" value={{ from: filters.from, to: filters.to }} onChange={({ from, to }) => update({ from, to })} />
                        <p className={cn('ml-auto flex items-baseline gap-1.5 pr-1 transition-opacity', loading && 'opacity-60')}>
                            <span className="text-lg font-semibold tabular-nums">{report.summary.documents.toLocaleString('en-PH')}</span>
                            <span className="text-sm text-muted-foreground">of {report.summary.total.toLocaleString('en-PH')} documents measured</span>
                        </p>
                    </div>
                    <FilterChips chips={chips} onReset={reset} />

                    <div className={cn('transition-opacity', loading && 'pointer-events-none opacity-60')} aria-busy={loading}>
                        {rows.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
                                <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                    <Timer className="size-5" />
                                </div>
                                <p className="text-sm font-medium">Nothing to measure yet</p>
                                <p className="text-sm text-muted-foreground">No office received and finished a document created in this period.</p>
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
                                        {head('name', 'Office', 'pl-4')}
                                        {head('avg', 'Average', 'text-right')}
                                        {head('min', 'Fastest', 'text-right')}
                                        {head('max', 'Slowest', 'pr-4 text-right')}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map((row) => {
                                        const open = expanded === row.id;
                                        const detail = details[detailKey(row.id)];

                                        return (
                                            <Fragment key={row.id}>
                                                <TableRow data-state={open ? 'selected' : undefined} className="data-[state=selected]:bg-emerald-50/60 dark:data-[state=selected]:bg-emerald-950/20">
                                                    <TableCell className="pl-2 whitespace-normal">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggle(row)}
                                                            aria-expanded={open}
                                                            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-left text-sm font-medium outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50"
                                                        >
                                                            <ChevronRight className={cn('size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-90')} aria-hidden="true" />
                                                            <span>
                                                                {row.name}
                                                                <span className="block text-xs font-normal text-muted-foreground">
                                                                    {row.hops} {row.hops === 1 ? 'document' : 'documents'} measured
                                                                </span>
                                                            </span>
                                                        </button>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium tabular-nums">{days(row.avg, 1)}</TableCell>
                                                    <TableCell className="text-right tabular-nums">{days(row.min)}</TableCell>
                                                    <TableCell className="pr-4 text-right tabular-nums">{days(row.max)}</TableCell>
                                                </TableRow>

                                                {open && (
                                                    <TableRow className="hover:bg-transparent">
                                                        <TableCell colSpan={4} className="bg-muted/30 px-4 py-3 whitespace-normal">
                                                            <OfficeBreakdown detail={detail} />
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </Fragment>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

/** An office's turnaround per procedure / category: what kinds of document it keeps longest. */
function OfficeBreakdown({ detail }: { detail: Detail | 'loading' | 'error' | undefined }) {
    if (detail === undefined || detail === 'loading') {
        return (
            <p className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading the breakdown…
            </p>
        );
    }

    if (detail === 'error') {
        return <p className="py-2 text-sm text-destructive">Couldn't load the breakdown. Close the row and open it again to retry.</p>;
    }

    if (detail.categories.length === 0) {
        return <p className="py-2 text-sm text-muted-foreground">No completed documents for this office.</p>;
    }

    return (
        <div className="overflow-hidden rounded-lg border bg-background">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-4">Procedure / Category</TableHead>
                        <TableHead className="text-right">Documents</TableHead>
                        <TableHead className="text-right">Average</TableHead>
                        <TableHead className="text-right">Fastest</TableHead>
                        <TableHead className="pr-4 text-right">Slowest</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {detail.categories.map((category) => (
                        <TableRow key={category.name}>
                            <TableCell className="pl-4 text-sm whitespace-normal">{category.name}</TableCell>
                            <TableCell className="text-right tabular-nums">{category.hops}</TableCell>
                            <TableCell className="text-right font-medium tabular-nums">{days(category.avg, 1)}</TableCell>
                            <TableCell className="text-right tabular-nums">{days(category.min)}</TableCell>
                            <TableCell className="pr-4 text-right tabular-nums">{days(category.max)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
