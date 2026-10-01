import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { Paginated } from '@/types';

const number = new Intl.NumberFormat('en-PH');

/** A list's footer: "Showing 1–25 of 312", the page, and previous/next. */
export default function Pagination({ page }: { page: Paginated<unknown> }) {
    if (page.total === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm">
            <p className="text-muted-foreground">
                Showing <span className="font-medium text-foreground">{number.format(page.from ?? 0)}</span>–
                <span className="font-medium text-foreground">{number.format(page.to ?? 0)}</span> of{' '}
                <span className="font-medium text-foreground">{number.format(page.total)}</span>
            </p>
            <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                    Page {number.format(page.current_page)} of {number.format(page.last_page)}
                </span>
                <PageLink href={page.prev_page_url} label="Previous page">
                    <ChevronLeft className="size-4" />
                </PageLink>
                <PageLink href={page.next_page_url} label="Next page">
                    <ChevronRight className="size-4" />
                </PageLink>
            </div>
        </div>
    );
}

function PageLink({ href, label, children }: { href: string | null; label: string; children: ReactNode }) {
    const className = 'flex size-8 items-center justify-center rounded-md border';

    return href ? (
        <Link
            href={href}
            preserveScroll
            preserveState
            aria-label={label}
            className={cn(className, 'hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none')}
        >
            {children}
        </Link>
    ) : (
        <span aria-disabled="true" aria-label={label} className={cn(className, 'text-muted-foreground opacity-50')}>
            {children}
        </span>
    );
}
