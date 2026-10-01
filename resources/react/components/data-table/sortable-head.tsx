import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { TableHead } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface SortableHeadProps {
    /** The server's sort key for this column, e.g. "created_at". */
    column: string;
    /** The current sort: the key, prefixed with "-" when descending. */
    sort: string;
    onSort: (sort: string) => void;
    /** Which way a first click sorts: newest first suits dates. */
    firstDirection?: 'asc' | 'desc';
    className?: string;
    children: ReactNode;
}

/** A column header that sorts by its column; clicking again flips the direction. */
export default function SortableHead({ column, sort, onSort, firstDirection = 'asc', className, children }: SortableHeadProps) {
    const active = sort === column || sort === `-${column}`;
    const descending = sort === `-${column}`;

    const next = active ? (descending ? column : `-${column}`) : firstDirection === 'desc' ? `-${column}` : column;
    const Icon = !active ? ArrowUpDown : descending ? ArrowDown : ArrowUp;

    return (
        <TableHead className={className} aria-sort={active ? (descending ? 'descending' : 'ascending') : 'none'}>
            <button
                type="button"
                onClick={() => onSort(next)}
                className={cn('-ml-2 inline-flex h-8 items-center gap-1.5 rounded-md px-2 hover:bg-accent hover:text-foreground', active && 'text-foreground')}
            >
                {children}
                <Icon className={cn('size-3.5', !active && 'opacity-40')} aria-hidden="true" />
            </button>
        </TableHead>
    );
}
