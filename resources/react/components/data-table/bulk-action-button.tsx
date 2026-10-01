import type { LucideIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface BulkActionButtonProps {
    icon: LucideIcon;
    label: string;
    /** How many rows it will act on. */
    count?: number;
    /** A single key that triggers it while nothing else has focus, e.g. "f". */
    shortcut?: string;
    variant?: 'primary' | 'secondary';
    disabled?: boolean;
    /** Shown on hover while disabled, so the reason is never a guess. */
    disabledReason?: string;
    onClick?: () => void;
    /** Makes it a link instead, e.g. a report to open in a new tab. */
    href?: string;
    newTab?: boolean;
}

const number = new Intl.NumberFormat('en-PH');

/** A selection toolbar action: icon, label and the count it acts on, with an optional one-key shortcut. */
export default function BulkActionButton({
    icon: Icon,
    label,
    count,
    shortcut,
    variant = 'secondary',
    disabled = false,
    disabledReason,
    onClick,
    href,
    newTab = false,
}: BulkActionButtonProps) {
    const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
    const primary = variant === 'primary';

    // The shortcut fires unless the key is meant for a field, a menu or a dialog.
    useEffect(() => {
        if (!shortcut || disabled) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;

            if (
                event.key.toLowerCase() === shortcut.toLowerCase() &&
                !event.ctrlKey &&
                !event.metaKey &&
                !event.altKey &&
                !event.defaultPrevented &&
                !target?.closest('input, textarea, select, [contenteditable="true"], [role="dialog"], [role="menu"], [role="listbox"]') &&
                !document.querySelector('[role="dialog"][data-state="open"]')
            ) {
                event.preventDefault();
                ref.current?.click();
            }
        };

        document.addEventListener('keydown', onKeyDown);

        return () => document.removeEventListener('keydown', onKeyDown);
    }, [shortcut, disabled]);

    const className = cn(
        'inline-flex h-9 items-center gap-2 rounded-md px-3.5 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:size-4 [&_svg]:shrink-0',
        primary
            ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
            : 'border bg-background shadow-xs hover:bg-accent dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
        disabled && 'pointer-events-none opacity-50',
    );

    const content = (
        <>
            <Icon aria-hidden="true" />
            {label}
            {count !== undefined && !disabled && (
                <span
                    className={cn(
                        'min-w-5 rounded-full px-1.5 text-center text-xs leading-5 font-semibold tabular-nums',
                        primary ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground',
                    )}
                >
                    {number.format(count)}
                </span>
            )}
        </>
    );

    const action = href ? (
        <a
            ref={ref}
            href={disabled ? undefined : href}
            aria-disabled={disabled || undefined}
            aria-keyshortcuts={shortcut}
            className={className}
            {...(newTab ? { target: '_blank', rel: 'noopener' } : {})}
        >
            {content}
        </a>
    ) : (
        <button ref={ref} type="button" onClick={onClick} disabled={disabled} aria-keyshortcuts={shortcut} className={className}>
            {content}
        </button>
    );

    // Disabled: say why. Enabled: name the shortcut, if there is one.
    const tip = disabled ? disabledReason : shortcut ? `${label} (${shortcut.toUpperCase()})` : undefined;

    if (!tip) {
        return action;
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                {/* A wrapper takes the hover: a disabled control fires no pointer events. */}
                {disabled ? (
                    <span tabIndex={0} className="rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                        {action}
                    </span>
                ) : (
                    action
                )}
            </TooltipTrigger>
            <TooltipContent className="max-w-64">{tip}</TooltipContent>
        </Tooltip>
    );
}
