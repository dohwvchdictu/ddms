import { Check, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface FacetOption {
    value: string;
    label: string;
    /** How many rows this option would show, given the other filters. */
    count?: number;
    /** Custom rendering in the list, e.g. a status pill; `label` is still searched. */
    display?: ReactNode;
}

interface FacetedFilterProps {
    title: string;
    icon: LucideIcon;
    options: FacetOption[];
    value: string[];
    onChange: (value: string[]) => void;
    /** Show a search box; worth it once the list is long. Defaults to more than 8 options. */
    searchable?: boolean;
}

const number = new Intl.NumberFormat('en-PH');

/** Plain substring match on the label, like the Combobox. */
const filter = (_value: string, search: string, keywords?: string[]) =>
    (keywords ?? []).join(' ').toLowerCase().includes(search.trim().toLowerCase()) ? 1 : 0;

/**
 * A dashed "+ Title" button that opens a checklist of options with live counts.
 * Once set, the button lists what is picked (up to two, then "N selected").
 */
export default function FacetedFilter({ title, icon: Icon, options, value, onChange, searchable }: FacetedFilterProps) {
    const selected = new Set(value);
    const picked = options.filter((option) => selected.has(option.value));
    const search = searchable ?? options.length > 8;

    const toggle = (option: string) => {
        const next = new Set(selected);
        next.has(option) ? next.delete(option) : next.add(option);
        // Keep the options' own order, so the URL is stable.
        onChange(options.map((item) => item.value).filter((item) => next.has(item)));
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        'inline-flex h-9 items-center gap-2 rounded-md border border-dashed px-3 text-sm font-medium shadow-xs transition-colors outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50',
                        value.length > 0 && 'border-solid border-emerald-600/40 bg-emerald-50/60 dark:bg-emerald-950/30',
                    )}
                >
                    <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                    {title}
                    {picked.length > 0 && (
                        <>
                            <Separator orientation="vertical" className="mx-0.5 !h-4" />
                            {picked.length > 2 ? (
                                <Pill>{picked.length} selected</Pill>
                            ) : (
                                picked.map((option) => <Pill key={option.value}>{option.label}</Pill>)
                            )}
                        </>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 p-0">
                <Command filter={filter}>
                    {search && <CommandInput placeholder={`Search ${title.toLowerCase()}…`} />}
                    <CommandList className="max-h-72">
                        <CommandEmpty>No match.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => {
                                const on = selected.has(option.value);

                                return (
                                    <CommandItem key={option.value} value={option.value} keywords={[option.label]} onSelect={() => toggle(option.value)}>
                                        <span
                                            className={cn(
                                                'flex size-4 shrink-0 items-center justify-center rounded-[4px] border',
                                                on ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-input [&_svg]:invisible',
                                            )}
                                            aria-hidden="true"
                                        >
                                            <Check className="size-3 !text-current" />
                                        </span>
                                        <span className="min-w-0 flex-1 truncate">{option.display ?? option.label}</span>
                                        {option.count !== undefined && (
                                            <span className={cn('ml-auto text-xs tabular-nums', option.count === 0 ? 'text-muted-foreground/50' : 'text-muted-foreground')}>
                                                {number.format(option.count)}
                                            </span>
                                        )}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                        {value.length > 0 && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem value="__clear" keywords={['clear']} onSelect={() => onChange([])} className="justify-center text-muted-foreground">
                                        Clear {title.toLowerCase()}
                                    </CommandItem>
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

function Pill({ children }: { children: ReactNode }) {
    return <span className="max-w-32 truncate rounded-sm bg-emerald-600/10 px-1.5 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-300">{children}</span>;
}
