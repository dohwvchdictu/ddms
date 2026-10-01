import { X } from 'lucide-react';

export interface FilterChip {
    key: string;
    /** What the filter is, e.g. "Status". */
    label: string;
    /** What it is set to, e.g. "Created, Closed". */
    value: string;
    onRemove: () => void;
}

/** The filters in effect, one removable chip each, and a reset. Renders nothing when there are none. */
export default function FilterChips({ chips, onReset }: { chips: FilterChip[]; onReset: () => void }) {
    if (chips.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-1.5 border-b bg-muted/20 px-3 py-2" aria-label="Active filters">
            {chips.map((chip) => (
                <span key={chip.key} className="inline-flex max-w-full items-center gap-1 rounded-full border bg-background py-0.5 pr-1 pl-2.5 text-xs shadow-xs">
                    <span className="text-muted-foreground">{chip.label}:</span>
                    <span className="max-w-56 truncate font-medium" title={chip.value}>
                        {chip.value}
                    </span>
                    <button
                        type="button"
                        onClick={chip.onRemove}
                        className="flex size-5 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                        aria-label={`Remove the ${chip.label.toLowerCase()} filter`}
                    >
                        <X className="size-3" />
                    </button>
                </span>
            ))}
            <button type="button" onClick={onReset} className="ml-1 text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline">
                Reset all
            </button>
        </div>
    );
}
