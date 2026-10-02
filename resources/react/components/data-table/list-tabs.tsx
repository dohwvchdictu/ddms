import { useRef, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

export interface ListTab {
    value: string;
    label: string;
    /** Rows on this tab under the other filters. */
    count?: number;
}

interface ListTabsProps {
    tabs: ListTab[];
    value: string;
    onChange: (value: string) => void;
    label: string;
}

const number = new Intl.NumberFormat('en-PH');

/** Underlined tabs across the top of a table card, with counts. Arrow keys move between them. */
export default function ListTabs({ tabs, value, onChange, label }: ListTabsProps) {
    const refs = useRef<(HTMLButtonElement | null)[]>([]);

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const current = tabs.findIndex((tab) => tab.value === value);
        const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;

        if (step === 0) {
            return;
        }

        event.preventDefault();
        const next = (current + step + tabs.length) % tabs.length;
        refs.current[next]?.focus();
        onChange(tabs[next].value);
    };

    return (
        // Scrolls sideways on narrow screens, without a visible scrollbar. overflow-y-hidden stops the
        // tabs' 1px underline overlap from adding a vertical scrollbar (a stray arrow and dot).
        <div
            role="tablist"
            aria-label={label}
            onKeyDown={onKeyDown}
            className="flex gap-1 overflow-x-auto overflow-y-hidden border-b px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
            {tabs.map((tab, index) => {
                const active = tab.value === value;

                return (
                    <button
                        key={tab.value}
                        ref={(element) => {
                            refs.current[index] = element;
                        }}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        tabIndex={active ? 0 : -1}
                        onClick={() => onChange(tab.value)}
                        className={cn(
                            '-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                            active ? 'border-emerald-600 text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
                        )}
                    >
                        {tab.label}
                        {tab.count !== undefined && (
                            <span
                                className={cn(
                                    'rounded-full px-1.5 text-xs leading-5 tabular-nums',
                                    active ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground',
                                )}
                            >
                                {number.format(tab.count)}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
