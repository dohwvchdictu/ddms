import { router } from '@inertiajs/react';
import { CircleAlert, Loader2, RotateCw } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/*
 * Loading states for pages whose data is a deferred prop (the lists and the
 * reports): the page opens at once and these skeletons stand in until the
 * data arrives. Filter changes, page turns and actions reload the data by
 * name (`only`), so the old rows stay up under LoadingBody's "Loading…"
 * badge instead of dropping back to the skeleton.
 */

/** Stand-ins shaped like the stat cards; `className` is the real cards' grid. */
export function StatCardsSkeleton({ count, className }: { count: number; className: string }) {
    return (
        <div className={className} aria-hidden="true">
            {Array.from({ length: count }, (_, card) => (
                <Card key={card} className="gap-3 p-4">
                    <Skeleton className="h-4 w-28" />
                    <div className="flex items-center justify-between gap-3">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="size-10 rounded-lg" />
                    </div>
                </Card>
            ))}
        </div>
    );
}

/** Varied widths, so the stand-in rows read as names of different lengths. */
const ROW_WIDTHS = [56, 40, 48, 36, 52, 44, 50, 38];

/** Stand-in table rows: a wide first column, then `columns` narrow ones. */
export function TableSkeleton({ columns, rows = 6 }: { columns: number; rows?: number }) {
    const figures = Array.from({ length: columns }, (_, column) => column);

    return (
        <div role="status" aria-label="Loading">
            <div className="flex h-10 items-center gap-4 border-b bg-muted/40 px-4">
                <Skeleton className="h-3.5 w-16" />
                <div className="ml-auto flex gap-4">
                    {figures.map((column) => (
                        <Skeleton key={column} className="h-3.5 w-14" />
                    ))}
                </div>
            </div>
            {ROW_WIDTHS.slice(0, rows).map((width, row) => (
                <div key={row} className="flex items-center gap-4 border-b px-4 py-3 last:border-b-0">
                    <div className="grid gap-1.5" style={{ width: `${width}%` }}>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-1/3" />
                    </div>
                    <div className="ml-auto flex gap-4">
                        {figures.map((column) => (
                            <Skeleton key={column} className="h-4 w-14" />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

/** A table area: while it reloads, the old rows fade under a "Loading…" badge. */
export function LoadingBody({ loading, children }: { loading: boolean; children: ReactNode }) {
    return (
        <div className="relative" aria-busy={loading}>
            {loading && (
                <div className="pointer-events-none absolute inset-x-0 top-10 z-10 flex justify-center">
                    <span className="flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-sm font-medium shadow-md">
                        <Loader2 className="size-4 animate-spin text-emerald-600" aria-hidden="true" />
                        Loading…
                    </span>
                </div>
            )}
            <div className={cn('transition-opacity', loading && 'pointer-events-none opacity-60')}>{children}</div>
        </div>
    );
}

/** Shown when the data failed on the server; the rest of the page still works. */
export function LoadFailed({ only, what = 'the report' }: { only: string[]; what?: string }) {
    const [retrying, setRetrying] = useState(false);

    const retry = () =>
        router.reload({
            only,
            onStart: () => setRetrying(true),
            onFinish: () => setRetrying(false),
        });

    return (
        <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300">
                <CircleAlert className="size-5" />
            </div>
            <p className="text-sm font-medium">Couldn't load {what}</p>
            <p className="text-sm text-muted-foreground">Something went wrong on the server. Please try again.</p>
            <Button variant="outline" size="sm" onClick={retry} disabled={retrying} className="mt-2">
                {retrying ? <Loader2 className="animate-spin" /> : <RotateCw />}
                Try again
            </Button>
        </div>
    );
}
