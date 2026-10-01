import { ListFilter } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SelectionBarProps {
    count: number;
    onClear: () => void;
    onReview: () => void;
    /** Swap back to the filters without dropping the selection. */
    onShowFilters?: () => void;
    /** A note under the bar, e.g. why an action is off and how to fix it. */
    notice?: ReactNode;
    /** The actions, right-aligned. */
    children: ReactNode;
}

const number = new Intl.NumberFormat('en-PH');

/**
 * A table toolbar while rows are selected: the count (click to review), the
 * checkbox or Esc to clear, and the actions. Sticks under the app header so the
 * actions stay in reach down a long list.
 */
export default function SelectionBar({ count, onClear, onReview, onShowFilters, notice, children }: SelectionBarProps) {
    // Esc clears, unless it is meant for a field, a menu or a dialog.
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;

            if (
                event.key === 'Escape' &&
                !event.defaultPrevented &&
                !target?.closest('input, textarea, select, [contenteditable="true"], [role="dialog"], [role="menu"], [role="listbox"]')
            ) {
                onClear();
            }
        };

        document.addEventListener('keydown', onKeyDown);

        return () => document.removeEventListener('keydown', onKeyDown);
    }, [onClear]);

    return (
        <div
            role="region"
            aria-label={`${count} selected`}
            className="sticky top-16 z-20 border-b border-emerald-200 bg-emerald-50/95 backdrop-blur animate-in duration-200 fade-in slide-in-from-top-1 dark:border-emerald-900 dark:bg-emerald-950/80"
        >
            <div className="flex min-h-15 flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            {/* Ticked with a dash: some rows are selected; clicking clears them. */}
                            <span>
                                <Checkbox
                                    checked="indeterminate"
                                    onCheckedChange={onClear}
                                    aria-label="Clear the selection"
                                    className="border-emerald-600 bg-emerald-600 text-white data-[state=indeterminate]:border-emerald-600 data-[state=indeterminate]:bg-emerald-600"
                                />
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>Clear selection (Esc)</TooltipContent>
                    </Tooltip>

                    <button
                        type="button"
                        onClick={onReview}
                        className="group inline-flex items-baseline gap-1.5 rounded-md text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                        <span className="text-base font-semibold text-emerald-900 tabular-nums dark:text-emerald-100">{number.format(count)}</span>
                        <span className="font-medium text-emerald-800 underline decoration-emerald-400 decoration-dotted underline-offset-4 group-hover:decoration-solid dark:text-emerald-300">
                            selected
                        </span>
                    </button>
                </div>

                <div className="flex items-center">
                    {onShowFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onShowFilters}
                            className="text-emerald-900 hover:bg-emerald-100 dark:text-emerald-200 dark:hover:bg-emerald-900/60"
                        >
                            <ListFilter />
                            Filters
                        </Button>
                    )}
                </div>

                <div className="ml-auto flex flex-wrap items-center gap-2">{children}</div>
            </div>

            {notice && (
                <div className="border-t border-emerald-200/70 bg-amber-50/80 px-3 py-2 text-sm text-amber-900 dark:border-emerald-900 dark:bg-amber-500/10 dark:text-amber-200">
                    {notice}
                </div>
            )}
        </div>
    );
}
