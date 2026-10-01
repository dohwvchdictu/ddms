import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FormSectionProps {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
}

/** A titled card of FormFields, one per row. */
export default function FormSection({ title, description, children, className }: FormSectionProps) {
    const id = `section-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    return (
        <section aria-labelledby={id} className={cn('overflow-hidden rounded-xl border bg-card shadow-sm', className)}>
            <header className="border-b bg-muted/30 px-4 py-3 sm:px-6">
                <h2 id={id} className="text-sm font-semibold">
                    {title}
                </h2>
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </header>
            <div className="divide-y">{children}</div>
        </section>
    );
}
