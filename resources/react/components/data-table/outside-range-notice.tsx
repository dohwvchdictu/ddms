import { CalendarClock } from 'lucide-react';

interface OutsideRangeNoticeProps {
    /** Rows that match every other filter but fall outside the date range. */
    count: number;
    /** What they are, plural: "documents", "purchase requests"… */
    kind: string;
    onShowAll: () => void;
}

/**
 * A queue's date range can hide rows that are still waiting (and still counted
 * in the sidebar badge). This says how many and offers them, so nothing is
 * forgotten just because it is old. Renders nothing when none are hidden.
 */
export default function OutsideRangeNotice({ count, kind, onShowAll }: OutsideRangeNoticeProps) {
    if (count <= 0) {
        return null;
    }

    return (
        <div role="status" className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
            <CalendarClock className="size-4 shrink-0" aria-hidden="true" />
            <span>
                {count} more {count === 1 ? kind.replace(/s$/, '') : kind} {count === 1 ? 'is' : 'are'} outside this date range.
            </span>
            <button type="button" onClick={onShowAll} className="font-medium underline underline-offset-2 hover:no-underline">
                Show all
            </button>
        </div>
    );
}
