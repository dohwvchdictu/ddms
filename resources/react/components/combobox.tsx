import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface ComboboxOption {
    value: string;
    label: string;
}

interface ComboboxProps {
    id?: string;
    options: ComboboxOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    invalid?: boolean;
    disabled?: boolean;
    className?: string;
    'aria-describedby'?: string;
    /** Options to offer first under their own heading, e.g. recently used; they stay in the full list too. */
    pinned?: { heading: string; values: string[] };
    /** Heading for the full list, shown only when there is a pinned group. */
    allHeading?: string;
}

/**
 * Plain substring match on the label. cmdk's default fuzzy match also scores the
 * item's value (an id here), so "12" would match every label with a 1 and a 2.
 */
function filter(_value: string, search: string, keywords?: string[]): number {
    return (keywords ?? []).join(' ').toLowerCase().includes(search.trim().toLowerCase()) ? 1 : 0;
}

/** A searchable select: a button that opens a filterable list. */
export default function Combobox({
    id,
    options,
    value,
    onChange,
    placeholder = 'Select…',
    searchPlaceholder = 'Search…',
    emptyText = 'No results found.',
    invalid = false,
    disabled = false,
    className,
    'aria-describedby': describedBy,
    pinned,
    allHeading = 'All',
}: ComboboxProps) {
    const [open, setOpen] = useState(false);
    const selected = options.find((option) => option.value === value);
    const pinnedOptions = (pinned?.values ?? [])
        .map((pinnedValue) => options.find((option) => option.value === pinnedValue))
        .filter((option): option is ComboboxOption => option !== undefined);

    const item = (option: ComboboxOption, keyPrefix = '') => (
        <CommandItem
            key={keyPrefix + option.value}
            // cmdk tracks items by value, so a pinned copy needs its own.
            value={keyPrefix + option.value}
            keywords={[option.label]}
            onSelect={() => {
                onChange(option.value);
                setOpen(false);
            }}
        >
            <Check className={cn('text-emerald-600', option.value === value ? 'opacity-100' : 'opacity-0')} aria-hidden="true" />
            <span className="whitespace-normal">{option.label}</span>
        </CommandItem>
    );

    return (
        // Modal, so the list scrolls with the mouse wheel inside a Dialog: the dialog blocks
        // wheel events outside itself, and the list is portalled out of it.
        <Popover open={open} onOpenChange={setOpen} modal>
            <PopoverTrigger asChild>
                <button
                    id={id}
                    type="button"
                    role="combobox"
                    aria-expanded={open}
                    aria-invalid={invalid || undefined}
                    aria-describedby={describedBy}
                    disabled={disabled}
                    className={cn(
                        'flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-left text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40',
                        className,
                    )}
                >
                    <span className={cn('truncate', !selected && 'text-muted-foreground')}>{selected?.label ?? placeholder}</span>
                    <ChevronsUpDown className="size-4 shrink-0 opacity-50" aria-hidden="true" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-(--radix-popover-trigger-width) min-w-64 p-0" align="start">
                <Command filter={filter}>
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty>{emptyText}</CommandEmpty>
                        {pinnedOptions.length > 0 && (
                            <CommandGroup heading={pinned?.heading}>{pinnedOptions.map((option) => item(option, 'pinned:'))}</CommandGroup>
                        )}
                        <CommandGroup heading={pinnedOptions.length > 0 ? allHeading : undefined}>
                            {options.map((option) => item(option))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
