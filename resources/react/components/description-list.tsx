import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface DescriptionItem {
    term: string;
    value: ReactNode;
    /** Left out when false, so optional fields can sit in the list unconditionally. */
    show?: boolean;
}

interface DescriptionListProps {
    items: DescriptionItem[];
    /** Columns from `sm` up; one column on phones. */
    columns?: 1 | 2 | 3 | 4;
    /** Stacked term-over-value tiles (facts) instead of term-beside-value rows. */
    variant?: 'rows' | 'stacked';
    className?: string;
}

const COLUMNS = { 1: '', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' };

/** Label–value pairs from a plain array, so a page adds a field by adding an entry. */
export default function DescriptionList({ items, columns = 1, variant = 'rows', className }: DescriptionListProps) {
    const shown = items.filter((item) => item.show !== false);

    return (
        <dl className={cn('grid gap-x-8', variant === 'stacked' ? 'gap-y-4' : 'gap-y-0', COLUMNS[columns], className)}>
            {shown.map((item) =>
                variant === 'stacked' ? (
                    <div key={item.term} className="min-w-0">
                        <dt className="text-xs text-muted-foreground">{item.term}</dt>
                        <dd className="mt-0.5 text-sm font-medium wrap-break-word">{item.value}</dd>
                    </div>
                ) : (
                    <div key={item.term} className="grid grid-cols-[7rem_1fr] gap-3 border-b py-2.5 text-sm last:border-b-0">
                        <dt className="text-muted-foreground">{item.term}</dt>
                        <dd className="min-w-0 wrap-break-word">{item.value}</dd>
                    </div>
                ),
            )}
        </dl>
    );
}
