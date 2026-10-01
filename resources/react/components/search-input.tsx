import { Loader2, Search, X } from 'lucide-react';
import { useRef, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    /** Accessible name, since there is no visible label. */
    label: string;
    /** Swaps the magnifier for a spinner while results load. */
    loading?: boolean;
    /** How many results the current search found; shown inside the box while searching. */
    resultCount?: number;
    className?: string;
}

const number = new Intl.NumberFormat('en-PH');

/**
 * A list's search box: a soft field that brightens on focus, a spinner while
 * results load, the match count once they're in, and ✕ or Esc to clear.
 */
export default function SearchInput({ value, onChange, placeholder = 'Search…', label, loading = false, resultCount, className }: SearchInputProps) {
    const input = useRef<HTMLInputElement>(null);
    const searching = value.trim() !== '';

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        // Esc clears first; a second Esc (box already empty) leaves the field.
        if (event.key === 'Escape') {
            if (value) {
                event.preventDefault();
                onChange('');
            } else {
                input.current?.blur();
            }
        }
    };

    return (
        <div
            className={cn(
                'group relative flex h-10 items-center rounded-lg border border-transparent bg-muted/60 transition-[background-color,border-color,box-shadow] focus-within:border-ring focus-within:bg-background focus-within:shadow-xs focus-within:ring-[3px] focus-within:ring-ring/30 hover:bg-muted',
                searching && 'border-input bg-background hover:bg-background',
                className,
            )}
        >
            {loading ? (
                <Loader2 className="pointer-events-none absolute left-3 size-4 animate-spin text-emerald-600" aria-hidden="true" />
            ) : (
                <Search
                    className={cn('pointer-events-none absolute left-3 size-4 text-muted-foreground transition-colors group-focus-within:text-foreground', searching && 'text-foreground')}
                    aria-hidden="true"
                />
            )}
            <input
                ref={input}
                type="search"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                aria-label={label}
                autoComplete="off"
                spellCheck={false}
                className="h-full min-w-0 flex-1 bg-transparent pr-2 pl-9 text-sm outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
            />
            {searching && (
                <div className="flex shrink-0 items-center gap-1 pr-1.5">
                    {resultCount !== undefined && !loading && (
                        <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground tabular-nums" aria-live="polite">
                            {number.format(resultCount)} {resultCount === 1 ? 'match' : 'matches'}
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={() => {
                            onChange('');
                            input.current?.focus();
                        }}
                        className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                        aria-label="Clear search"
                        title="Clear (Esc)"
                    >
                        <X className="size-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
