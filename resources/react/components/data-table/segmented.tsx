import { cn } from '@/lib/utils';

export interface SegmentedOption {
    value: string;
    label: string;
    count?: number;
}

interface SegmentedProps {
    /** What the choice is about, for screen readers. */
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: SegmentedOption[];
}

/** A small one-of-a-few switch for a toolbar (e.g. Anyone | To me), with optional counts. */
export default function Segmented({ label, value, onChange, options }: SegmentedProps) {
    return (
        <div role="radiogroup" aria-label={label} className="inline-flex h-9 items-center rounded-md border bg-background p-0.5 shadow-xs">
            {options.map((option) => {
                const on = option.value === value;

                return (
                    <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            'flex h-full items-center gap-1.5 rounded-sm px-2.5 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                            on ? 'bg-emerald-600 font-medium text-white' : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        {option.label}
                        {option.count !== undefined && <span className={cn('text-xs tabular-nums', on ? 'text-white/80' : 'text-muted-foreground')}>{option.count}</span>}
                    </button>
                );
            })}
        </div>
    );
}
