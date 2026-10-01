import { STATUS_STYLES } from '@/components/document-tracking';
import { cn } from '@/lib/utils';

/** A document's workflow status as a coloured pill, the same colours everywhere. */
export default function StatusBadge({ status, className }: { status: string; className?: string }) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
                STATUS_STYLES[status] ?? STATUS_STYLES.Created,
                className,
            )}
        >
            {status}
        </span>
    );
}
