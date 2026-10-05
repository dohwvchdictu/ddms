import { cn } from '@/lib/utils';

/** A percentage to two places, or a dash when there was nothing to rate. */
export const percent = (rate: number | null) => (rate === null ? '—' : `${rate.toFixed(2)}%`);

/**
 * A rate with a thin bar under it, so the low ones stand out down a column:
 * green from 80%, amber from 50%, red below.
 */
export default function RateCell({ rate }: { rate: number | null }) {
    if (rate === null) {
        return <span className="text-muted-foreground">—</span>;
    }

    return (
        <div className="ml-auto grid w-24 gap-1">
            <span className="text-sm tabular-nums">{percent(rate)}</span>
            <span className="h-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                <span
                    className={cn('block h-full rounded-full', rate >= 80 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-500' : 'bg-red-500')}
                    style={{ width: `${Math.min(rate, 100)}%` }}
                />
            </span>
        </div>
    );
}
