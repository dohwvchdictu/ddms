import { Deferred, Head } from '@inertiajs/react';
import { CircleCheckBig, Hourglass, Inbox, Percent, type LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import DateRangeFilter, { describeRange, isSameRange, rangeQuery, type DateRangeValue } from '@/components/data-table/date-range-filter';
import SortableHead from '@/components/data-table/sortable-head';
import RateCell, { percent } from '@/components/reports/rate-cell';
import { LoadingBody, LoadFailed, StatCardsSkeleton, TableSkeleton } from '@/components/data-table/deferred-states';
import StatCard from '@/components/reports/stat-card';
import SearchInput from '@/components/search-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableFooter, TableHeader, TableRow } from '@/components/ui/table';
import { useListFilters } from '@/hooks/use-list-filters';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { endorsements as endorsementsReport } from '@/routes/reports';

interface Totals {
    incoming: number;
    pending: number;
    processed: number;
    /** Processed ÷ (incoming + pending + processed), in percent; null when there were none. */
    rate: number | null;
}

interface EmployeeRow extends Totals {
    id: number | string;
    /** Last name first. */
    name: string;
}

interface Filters extends DateRangeValue {
    [key: string]: unknown;
}

interface Props {
    filters: Filters;
    /** The last 30 days: what the report shows with no dates in the URL. */
    defaultRange: DateRangeValue;
    /** Deferred: undefined until it arrives after the page opens. */
    report?: { totals: Totals; employees: EmployeeRow[] };
    officeName: string | null;
}

type Column = 'name' | 'incoming' | 'pending' | 'processed' | 'rate';

const number = new Intl.NumberFormat('en-PH');

const CARDS: { key: keyof Totals; label: string; icon: LucideIcon; tile: string; tooltip: string }[] = [
    {
        key: 'incoming',
        label: 'Incoming',
        icon: Inbox,
        tile: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
        tooltip: 'Documents sent to your office and endorsed to someone, not yet received.',
    },
    {
        key: 'pending',
        label: 'Pending',
        icon: Hourglass,
        tile: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
        tooltip: 'Documents endorsed to someone in your office, received and still on process.',
    },
    {
        key: 'processed',
        label: 'Processed',
        icon: CircleCheckBig,
        tile: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
        tooltip: 'Documents someone in your office finished: forwarded on or closed. Counted for whoever did it.',
    },
    {
        key: 'rate',
        label: 'Completion rate',
        icon: Percent,
        tile: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
        tooltip: 'Processed out of all their documents: processed ÷ (incoming + pending + processed).',
    },
];

const CARD_GRID = 'grid grid-cols-2 gap-3 lg:grid-cols-4';

const isIdle = (row: EmployeeRow) => row.incoming + row.pending + row.processed === 0;

export default function EndorsementsReport({ filters: initial, defaultRange, report, officeName }: Props) {
    const toUrl = (filters: Filters) => endorsementsReport.url({ query: rangeQuery(filters, defaultRange) });
    const { filters, update, loading } = useListFilters(initial, toUrl, { only: ['filters', 'report'] });
    const [search, setSearch] = useState('');
    const [hideIdle, setHideIdle] = useState(false);
    const [sort, setSort] = useState<string>('name');

    const rows = useMemo(() => {
        const term = search.trim().toLowerCase();
        const descending = sort.startsWith('-');
        const column = (descending ? sort.slice(1) : sort) as Column;

        return (report?.employees ?? [])
            .filter((row) => !hideIdle || !isIdle(row))
            .filter((row) => term === '' || row.name.toLowerCase().includes(term))
            .sort((a, b) => {
                const order = column === 'name' ? a.name.localeCompare(b.name) : (a[column] ?? -1) - (b[column] ?? -1) || a.name.localeCompare(b.name);

                return descending ? -order : order;
            });
    }, [report?.employees, search, hideIdle, sort]);

    const head = (column: Column, label: string, className?: string) => (
        <SortableHead column={column} sort={sort} onSort={setSort} firstDirection={column === 'name' ? 'asc' : 'desc'} className={className}>
            {label}
        </SortableHead>
    );

    return (
        <AppLayout title="Endorsements">
            <Head title="Endorsements" />

            <div className="grid gap-4">
                <div className="flex flex-wrap items-center gap-2">
                    <DateRangeFilter label="Created" value={{ from: filters.from, to: filters.to }} onChange={({ from, to }) => update({ from, to })} />
                    {!isSameRange(filters, defaultRange) && (
                        <Button variant="ghost" size="sm" onClick={() => update({ ...defaultRange })} className="text-muted-foreground">
                            Back to the last 30 days
                        </Button>
                    )}
                </div>

                {/* On a failure the cards are left out; the table area explains and offers a retry. */}
                <Deferred data="report" fallback={<StatCardsSkeleton count={4} className={CARD_GRID} />} rescue={<></>}>
                    {report && (
                        <div className={cn(CARD_GRID, 'transition-opacity', loading && 'opacity-60')}>
                            {CARDS.map(({ key, ...card }) => (
                                <StatCard key={key} {...card} value={key === 'rate' ? percent(report.totals.rate) : number.format(report.totals[key] ?? 0)} />
                            ))}
                        </div>
                    )}
                </Deferred>

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

                    <div className="flex min-h-15 flex-wrap items-center gap-3 border-b p-3">
                        <div className="mr-auto">
                            <h2 className="text-sm font-semibold">By employee{officeName && ` · ${officeName}`}</h2>
                            <p className="text-xs text-muted-foreground">Documents created {describeRange(filters).toLowerCase()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch id="hide-idle" checked={hideIdle} onCheckedChange={setHideIdle} />
                            <Label htmlFor="hide-idle" className="text-sm font-normal">
                                Only employees with documents
                            </Label>
                        </div>
                        <SearchInput value={search} onChange={setSearch} placeholder="Search employee…" label="Search employees" className="w-full sm:w-64" />
                    </div>

                    <Deferred data="report" fallback={<TableSkeleton columns={4} />} rescue={<LoadFailed only={['report']} />}>
                        {report && (
                            <LoadingBody loading={loading}>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                                            {head('name', 'Employee', 'pl-4')}
                                            {head('incoming', 'Incoming', 'text-right')}
                                            {head('pending', 'Pending', 'text-right')}
                                            {head('processed', 'Processed', 'text-right')}
                                            {head('rate', 'Completion rate', 'pr-4 text-right')}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rows.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                                                    {search ? 'No employee matches that search.' : 'No one had endorsed documents in this period.'}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            rows.map((row) => (
                                                <TableRow key={row.id} className={cn(isIdle(row) && 'text-muted-foreground')}>
                                                    <TableCell className="pl-4 text-sm font-medium whitespace-normal text-foreground">{row.name}</TableCell>
                                                    <TableCell className="text-right tabular-nums">{number.format(row.incoming)}</TableCell>
                                                    <TableCell className="text-right tabular-nums">{number.format(row.pending)}</TableCell>
                                                    <TableCell className="text-right tabular-nums">{number.format(row.processed)}</TableCell>
                                                    <TableCell className="pr-4 text-right">
                                                        <RateCell rate={row.rate} />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow className="font-semibold">
                                            <TableCell className="pl-4">Whole office</TableCell>
                                            <TableCell className="text-right tabular-nums">{number.format(report.totals.incoming)}</TableCell>
                                            <TableCell className="text-right tabular-nums">{number.format(report.totals.pending)}</TableCell>
                                            <TableCell className="text-right tabular-nums">{number.format(report.totals.processed)}</TableCell>
                                            <TableCell className="pr-4 text-right tabular-nums">{percent(report.totals.rate)}</TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </LoadingBody>
                        )}
                    </Deferred>
                </div>
            </div>
        </AppLayout>
    );
}
