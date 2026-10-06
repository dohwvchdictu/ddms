import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, Plus } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { groups, newDocument, primary, type NavGroup, type NavItem } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import type { SidebarCounts } from '@/types';

interface AppSidebarProps {
    /** Icon-only rail (desktop). Ignored inside the mobile sheet. */
    collapsed?: boolean;
    /** Called after a link is chosen, so the mobile sheet can close. */
    onNavigate?: () => void;
}

/** Which groups the user has opened or closed, remembered across pages and visits. */
const OPEN_GROUPS_KEY = 'sidebarOpenGroups';

function readOpenGroups(): Record<string, boolean> {
    try {
        const saved = JSON.parse(localStorage.getItem(OPEN_GROUPS_KEY) ?? '{}');

        return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
    } catch {
        return {};
    }
}

function saveOpenGroups(groups: Record<string, boolean>): void {
    try {
        localStorage.setItem(OPEN_GROUPS_KEY, JSON.stringify(groups));
    } catch {
        // Storage blocked: groups fall back to their default on the next page.
    }
}

function isActive(url: string, href: string): boolean {
    const path = url.split('?')[0];

    return path === href || path.startsWith(`${href}/`);
}

/** A sidebar link: an Inertia visit, marked when it is the current page. */
function NavLink({
    href,
    className,
    onNavigate,
    current,
    label,
    children,
}: {
    href: string;
    className: string;
    onNavigate?: () => void;
    current?: boolean;
    /** Accessible name when the visible text is hidden (icon rail). */
    label?: string;
    children: ReactNode;
}) {
    const props = {
        href,
        className,
        onClick: onNavigate,
        'aria-current': current ? ('page' as const) : undefined,
        'aria-label': label,
    };

    return <Link {...props}>{children}</Link>;
}

function CountBadge({ count }: { count: number }) {
    return count > 0 ? (
        <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[0.7rem] leading-none font-semibold text-white tabular-nums">
            {count}
        </span>
    ) : null;
}

/** The count pinned to an icon's corner while the sidebar is an icon rail. */
function RailBadge({ count }: { count: number }) {
    return count > 0 ? (
        <span className="absolute -top-2 left-2.5 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-1 text-[0.55rem] leading-none font-semibold text-white tabular-nums ring-2 ring-background">
            {count > 99 ? '99+' : count}
        </span>
    ) : null;
}

const rowBase =
    'group/row relative flex w-full items-center gap-3 rounded-lg px-2.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50';
const rowIdle = 'text-foreground/75 hover:bg-accent hover:text-foreground';
/** The active page: tinted row with a green bar on its left edge. */
const rowActive =
    'bg-emerald-100/70 font-medium text-emerald-800 before:absolute before:inset-y-1.5 before:-left-3 before:w-1 before:rounded-r-full before:bg-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300';

function iconClass(active: boolean): string {
    return cn('shrink-0', active ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground group-hover/row:text-foreground');
}

/** Wraps a row in a hover label while the sidebar is an icon rail. */
function RailTip({ show, label, children }: { show: boolean; label: string; children: ReactNode }) {
    if (!show) {
        return <>{children}</>;
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent side="right" sideOffset={12}>
                {label}
            </TooltipContent>
        </Tooltip>
    );
}

export default function AppSidebar({ collapsed = false, onNavigate }: AppSidebarProps) {
    const { url, props } = usePage();
    const counts = props.sidebarCounts;
    const count = (key?: keyof SidebarCounts) => (key && counts ? counts[key] : 0);

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(readOpenGroups);
    /** Which group's pop-out menu is open in the rail. */
    const [flyout, setFlyout] = useState<string | null>(null);

    const groupActive = (group: NavGroup) => group.items.some((item) => isActive(url, item.href));

    // The user's choice wins, else the group's default; the group holding the
    // current page always shows it.
    const isOpen = (group: NavGroup) => groupActive(group) || (openGroups[group.title] ?? group.defaultOpen ?? true);

    const toggleGroup = (group: NavGroup) => {
        const next = { ...openGroups, [group.title]: !isOpen(group) };
        setOpenGroups(next);
        saveOpenGroups(next);
    };

    /** A page link: full row when expanded, an icon with a tooltip in the rail. */
    const renderItem = (item: NavItem, { nested = false, inFlyout = false } = {}) => {
        const Icon = item.icon;
        const active = isActive(url, item.href);
        const itemCount = count(item.badge);
        const rail = collapsed && !inFlyout;

        return (
            <li key={item.href}>
                <RailTip show={rail} label={itemCount > 0 ? `${item.title} · ${itemCount}` : item.title}>
                    <NavLink
                        href={item.href}
                        current={active}
                        label={rail ? item.title : undefined}
                        onNavigate={() => {
                            setFlyout(null);
                            onNavigate?.();
                        }}
                        className={cn(
                            rowBase,
                            nested || inFlyout ? 'h-8' : 'h-9',
                            rail && 'justify-center px-0',
                            active ? rowActive : rowIdle,
                            inFlyout && 'before:hidden',
                        )}
                    >
                        <span className="relative">
                            <Icon weight={active ? 'fill' : 'bold'} className={cn(iconClass(active), nested || inFlyout ? 'size-4' : 'size-[1.15rem]')} />
                            {rail && <RailBadge count={itemCount} />}
                        </span>
                        {!rail && (
                            <>
                                <span className="truncate">{item.title}</span>
                                <CountBadge count={itemCount} />
                            </>
                        )}
                    </NavLink>
                </RailTip>
            </li>
        );
    };

    const renderGroup = (group: NavGroup) => {
        const Icon = group.icon;
        const active = groupActive(group);

        // Rail: the icon opens a pop-out of the group's pages on hover or click.
        if (collapsed) {
            return (
                <li key={group.title}>
                    <HoverCard
                        open={flyout === group.title}
                        onOpenChange={(open) => setFlyout(open ? group.title : null)}
                        openDelay={60}
                        closeDelay={120}
                    >
                        <HoverCardTrigger asChild>
                            <button
                                type="button"
                                onClick={() => setFlyout((current) => (current === group.title ? null : group.title))}
                                aria-label={group.title}
                                aria-haspopup="menu"
                                aria-expanded={flyout === group.title}
                                className={cn(
                                    rowBase,
                                    'h-9 justify-center px-0',
                                    active ? 'bg-emerald-100/70 dark:bg-emerald-500/15' : rowIdle,
                                    flyout === group.title && !active && 'bg-accent',
                                )}
                            >
                                <span className="relative">
                                    <Icon weight="fill" className={cn(iconClass(active), 'size-[1.15rem]')} />
                                    <RailBadge count={count(group.badge)} />
                                </span>
                            </button>
                        </HoverCardTrigger>
                        <HoverCardContent side="right" align="start" sideOffset={12} className="w-60 p-2">
                            <p className="px-2.5 pt-1 pb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                {group.title}
                            </p>
                            <ul className="space-y-0.5">{group.items.map((item) => renderItem(item, { inFlyout: true }))}</ul>
                        </HoverCardContent>
                    </HoverCard>
                </li>
            );
        }

        const open = isOpen(group);
        const panelId = `sidebar-group-${group.title.toLowerCase().replace(/\s+/g, '-')}`;

        return (
            <li key={group.title}>
                <button
                    type="button"
                    onClick={() => toggleGroup(group)}
                    aria-expanded={open}
                    aria-controls={panelId}
                    className={cn(rowBase, 'h-9', rowIdle, active && 'text-foreground')}
                >
                    <Icon weight="fill" className={cn(iconClass(active), 'size-[1.15rem]')} />
                    <span className="truncate">{group.title}</span>
                    {/* While open, the counts show on the rows themselves. */}
                    {!open && <CountBadge count={count(group.badge)} />}
                    <ChevronDown
                        className={cn(
                            'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
                            (open || !count(group.badge)) && 'ml-auto',
                            open && 'rotate-180',
                        )}
                        aria-hidden="true"
                    />
                </button>

                {/* Animates height by moving the grid row between 0fr and 1fr. */}
                <div
                    id={panelId}
                    className={cn(
                        'grid transition-[grid-template-rows,opacity] duration-200 ease-out',
                        open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                    )}
                    inert={!open}
                >
                    <div className="overflow-hidden">
                        <ul className="mt-0.5 ml-[1.15rem] space-y-0.5 border-l pl-2.5">
                            {group.items.map((item) => renderItem(item, { nested: true }))}
                        </ul>
                    </div>
                </div>
            </li>
        );
    };

    const NewIcon = newDocument.icon;
    const creating = isActive(url, newDocument.href);

    return (
        <nav id="app-sidebar" aria-label="Main" className="flex h-full flex-col">
            <div className="flex-1 space-y-3 overflow-x-hidden overflow-y-auto px-3 pt-3 pb-4">
                <ul className="space-y-0.5">{primary.map((item) => renderItem(item))}</ul>

                {/* The main call to action. */}
                <RailTip show={collapsed} label={newDocument.title}>
                    <NavLink
                        href={newDocument.href}
                        current={creating}
                        label={collapsed ? newDocument.title : undefined}
                        onNavigate={onNavigate}
                        className={cn(
                            'flex h-10 w-full items-center gap-2 rounded-lg bg-emerald-600 text-sm font-semibold text-white shadow-sm transition-colors outline-none hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                            collapsed ? 'justify-center' : 'px-3',
                            creating && 'ring-2 ring-emerald-500/40 ring-offset-2 ring-offset-background',
                        )}
                    >
                        {collapsed ? <Plus className="size-5" /> : <NewIcon className="size-[1.15rem]" />}
                        {!collapsed && <span>{newDocument.title}</span>}
                        {!collapsed && <Plus className="ml-auto size-4 opacity-80" aria-hidden="true" />}
                    </NavLink>
                </RailTip>

                <hr className={cn('border-border', collapsed ? 'mx-2' : 'mx-1')} />

                <ul className="space-y-1">{groups.filter((group) => group.requires !== 'administer' || props.auth.canAdminister).map(renderGroup)}</ul>
            </div>
        </nav>
    );
}
