import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/ui/card';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

export interface ActivityPoint {
    date: string;
    created: number;
    closed: number;
}

/** Validated categorical slots 1 and 2 (see --chart-series-* in app.css). */
const config = {
    created: { label: 'New', color: 'var(--chart-series-1)' },
    closed: { label: 'Closed', color: 'var(--chart-series-2)' },
} satisfies ChartConfig;

const tick = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric' });
const full = new Intl.DateTimeFormat('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
const number = new Intl.NumberFormat('en-PH');

/** Dates arrive as YYYY-MM-DD; parse as local dates, not UTC midnight. */
function parseDay(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);

    return new Date(year, month - 1, day);
}

/**
 * New vs closed documents per day. Two series on one count axis, a
 * crosshair tooltip and a legend (the totals above name each line too); a
 * screen-reader table carries the same numbers.
 */
export default function ActivityChart({ data }: { data: ActivityPoint[] }) {
    const totals = data.reduce((sum, day) => ({ created: sum.created + day.created, closed: sum.closed + day.closed }), { created: 0, closed: 0 });

    return (
        <Card className="gap-4 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-sm font-semibold">New vs closed documents</h2>
                    <p className="text-xs text-muted-foreground">Whole system · last {data.length} days</p>
                </div>
                <dl className="flex gap-5 text-right">
                    <div>
                        <dt className="text-xs text-muted-foreground">New</dt>
                        <dd className="text-lg font-semibold">{number.format(totals.created)}</dd>
                    </div>
                    <div>
                        <dt className="text-xs text-muted-foreground">Closed</dt>
                        <dd className="text-lg font-semibold">{number.format(totals.closed)}</dd>
                    </div>
                </dl>
            </div>

            <ChartContainer config={config} className="aspect-auto h-64 w-full" aria-hidden="true">
                <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                    <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={{ stroke: 'var(--chart-grid)' }}
                        tickMargin={8}
                        minTickGap={28}
                        tickFormatter={(value: string) => tick.format(parseDay(value))}
                        tick={{ fill: 'var(--chart-axis)' }}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        width={40}
                        allowDecimals={false}
                        tick={{ fill: 'var(--chart-axis)' }}
                    />
                    <ChartTooltip
                        cursor={{ stroke: 'var(--chart-axis)', strokeDasharray: '3 3' }}
                        content={
                            <ChartTooltipContent
                                indicator="line"
                                labelFormatter={(_, payload) => {
                                    const date = payload?.[0]?.payload?.date as string | undefined;

                                    return date ? full.format(parseDay(date)) : '';
                                }}
                            />
                        }
                    />
                    <ChartLegend content={<ChartLegendContent />} verticalAlign="top" itemSorter={(item) => (item.dataKey === 'created' ? 0 : 1)} />
                    {(['created', 'closed'] as const).map((key) => (
                        <Line
                            key={key}
                            dataKey={key}
                            type="monotone"
                            stroke={`var(--color-${key})`}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--background)' }}
                            isAnimationActive={false}
                        />
                    ))}
                </LineChart>
            </ChartContainer>

            <table className="sr-only">
                <caption>New and closed documents per day, last {data.length} days</caption>
                <thead>
                    <tr>
                        <th scope="col">Date</th>
                        <th scope="col">New</th>
                        <th scope="col">Closed</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((day) => (
                        <tr key={day.date}>
                            <th scope="row">{full.format(parseDay(day.date))}</th>
                            <td>{day.created}</td>
                            <td>{day.closed}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
    );
}
