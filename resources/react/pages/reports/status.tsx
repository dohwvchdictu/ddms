import { Head } from '@inertiajs/react';
import { CircleCheckBig, Clock, Hourglass, Inbox, Percent, Printer, type LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import DateRangeFilter, { describeRange, isSameRange, rangeQuery, type DateRangeValue } from '@/components/data-table/date-range-filter';
import SortableHead from '@/components/data-table/sortable-head';
import RateCell, { percent } from '@/components/reports/rate-cell';
import StatCard from '@/components/reports/stat-card';
import SearchInput from '@/components/search-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useListFilters } from '@/hooks/use-list-filters';
import AppLayout from '@/layouts/app-layout';
import { printPage } from '@/lib/print-page';
import { cn } from '@/lib/utils';
import { status as statusReport } from '@/routes/reports';

interface Totals {
    received: number;
    completed: number;
    pending: number;
    overdue: number;
    /** Completed ÷ Received, in percent; null when nothing was received. */
    rate: number | null;
}

interface OfficeRow extends Totals {
    id: number | string;
    name: string;
    code: string | null;
}

interface Filters extends DateRangeValue {
    [key: string]: unknown;
}

interface Props {
    filters: Filters;
    /** The last 30 days: what the report shows with no dates in the URL. */
    defaultRange: DateRangeValue;
    report: { totals: Totals; offices: OfficeRow[] };
    printUrl: string;
}

type Column = 'name' | 'received' | 'completed' | 'pending' | 'overdue' | 'rate';

const number = new Intl.NumberFormat('en-PH');

/** The cards across the top, in reading order: what came in, what got done, what is left. */
const CARDS: { key: keyof Totals; label: string; icon: LucideIcon; tile: string; tooltip: string }[] = [
    {
        key: 'received',
        label: 'Received',
        icon: Inbox,
        tile: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
        tooltip: 'Documents offices took in during this period. The basis of the completion rate.',
    },
    {
        key: 'completed',
        label: 'Completed',
        icon: CircleCheckBig,
        tile: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
        tooltip: 'Of the documents received in this period, how many the office has since finished: forwarded onward or closed.',
    },
    {
        key: 'pending',
        label: 'Pending',
        icon: Hourglass,
        tile: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
        tooltip: 'Documents created in this period that are still on process.',
    },
    {
        key: 'overdue',
        label: 'Overdue',
        icon: Clock,
        tile: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
        tooltip:
            'Pending documents past their deadline: the date created plus the required days of their citizen charter, or of their document type when they have none. Charged to the office now holding them.',
    },
    {
        key: 'rate',
        label: 'Completion rate',
        icon: Percent,
        tile: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
        tooltip: 'The share of received documents that offices finished: Completed divided by Received.',
    },
];

const isIdle = (row: OfficeRow) => row.received + row.completed + row.pending + row.overdue === 0;

export default function StatusReport({ filters: initial, defaultRange, report, printUrl }: Props) {
    const toUrl = (filters: Filters) => statusReport.url({ query: rangeQuery(filters, defaultRange) });
    const { filters, update, loading } = useListFilters(initial, toUrl);
    const [search, setSearch] = useState('');
    const [hideIdle, setHideIdle] = useState(false);
    const [sort, setSort] = useState<string>('name');

    const rows = useMemo(() => {
        const term = search.trim().toLowerCase();
        const descending = sort.startsWith('-');
        const column = (descending ? sort.slice(1) : sort) as Column;

        return report.offices
            .filter((row) => !hideIdle || !isIdle(row))
            .filter((row) => term === '' || row.name.toLowerCase().includes(term) || row.code?.toLowerCase().includes(term))
            .sort((a, b) => {
                const order =
                    column === 'name' ? a.name.localeCompare(b.name) : (a[column] ?? -1) - (b[column] ?? -1) || a.name.localeCompare(b.name);

                return descending ? -order : order;
            });
    }, [report.offices, search, hideIdle, sort]);

    const head = (column: Column, label: string, className?: string) => (
        <SortableHead column={column} sort={sort} onSort={setSort} firstDirection={column === 'name' ? 'asc' : 'desc'} className={className}>
            {label}
        </SortableHead>
    );

    return (
        <AppLayout
            title="Status of Documents"
            actions={
                // Straight to the browser's print preview, over this page (like the Document Tracking Form).
                <Button variant="outline" onClick={() => printPage(printUrl, { title: 'Status of Documents report' })}>
                    <Printer />
                    Print
                </Button>
            }
        >
            <Head title="Status of Documents" />

            <div className="grid gap-4">
                <div className="flex flex-wrap items-center gap-2">
                    <DateRangeFilter label="Period" value={{ from: filters.from, to: filters.to }} onChange={({ from, to }) => update({ from, to })} />
                    {!isSameRange(filters, defaultRange) && (
                        <Button variant="ghost" size="sm" onClick={() => update({ ...defaultRange })} className="text-muted-foreground">
                            Back to the last 30 days
                        </Button>
                    )}
                    <span className="sr-only" aria-live="polite">
                        Showing {describeRange(filters)}
                    </span>
                </div>

                <div className={cn('grid grid-cols-2 gap-3 transition-opacity sm:grid-cols-3 lg:grid-cols-5', loading && 'opacity-60')}>
                    {CARDS.map(({ key, ...card }) => (
                        <StatCard
                            key={key}
                            {...card}
                            value={key === 'rate' ? percent(report.totals.rate) : number.format(report.totals[key] ?? 0)}
                            alert={key === 'overdue' && report.totals.overdue > 0}
                        />
                    ))}
                </div>

                <div className="relative overflow-clip rounded-xl border bg-card shadow-sm">
                    {loading && (
                        <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-emerald-100 dark:bg-emerald-950" role="progressbar" aria-label="Loading">
                            <div className="h-full w-1/3 animate-[table-progress_1s_ease-in-out_infinite] bg-emerald-600" />
                        </div>
                    )}

                    <div className="flex min-h-15 flex-wrap items-center gap-3 border-b p-3">
                        <div className="mr-auto">
                            <h2 className="text-sm font-semibold">By office</h2>
                            <p className="text-xs text-muted-foreground">{describeRange(filters)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch id="hide-idle" checked={hideIdle} onCheckedChange={setHideIdle} />
                            <Label htmlFor="hide-idle" className="text-sm font-normal">
                                Only offices with activity
                            </Label>
                        </div>
                        <SearchInput value={search} onChange={setSearch} placeholder="Search office…" label="Search offices" className="w-full sm:w-64" />
                    </div>

                    <div className={cn('transition-opacity', loading && 'pointer-events-none opacity-60')} aria-busy={loading}>
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    {head('name', 'Office', 'pl-4')}
                                    {head('received', 'Received', 'text-right')}
                                    {head('completed', 'Completed', 'text-right')}
                                    {head('pending', 'Pending', 'text-right')}
                                    {head('overdue', 'Overdue', 'text-right')}
                                    {head('rate', 'Completion rate', 'pr-4 text-right')}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                                            {search ? 'No office matches that search.' : 'No office had activity in this period.'}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rows.map((row) => (
                                        <TableRow key={row.id} className={cn(isIdle(row) && 'text-muted-foreground')}>
                                            <TableCell className="max-w-md pl-4 whitespace-normal">
                                                <p className="text-sm font-medium text-foreground">{row.name}</p>
                                                {row.code && <p className="text-xs text-muted-foreground">{row.code}</p>}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">{number.format(row.received)}</TableCell>
                                            <TableCell className="text-right tabular-nums">{number.format(row.completed)}</TableCell>
                                            <TableCell className="text-right tabular-nums">{number.format(row.pending)}</TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {row.overdue > 0 ? (
                                                    <span className="inline-flex min-w-7 justify-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-300">
                                                        {number.format(row.overdue)}
                                                    </span>
                                                ) : (
                                                    0
                                                )}
                                            </TableCell>
                                            <TableCell className="pr-4 text-right">
                                                <RateCell rate={row.rate} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                            <TableFooter>
                                <TableRow className="font-semibold">
                                    <TableCell className="pl-4">All offices</TableCell>
                                    <TableCell className="text-right tabular-nums">{number.format(report.totals.received)}</TableCell>
                                    <TableCell className="text-right tabular-nums">{number.format(report.totals.completed)}</TableCell>
                                    <TableCell className="text-right tabular-nums">{number.format(report.totals.pending)}</TableCell>
                                    <TableCell className="text-right tabular-nums">{number.format(report.totals.overdue)}</TableCell>
                                    <TableCell className="pr-4 text-right tabular-nums">{percent(report.totals.rate)}</TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
