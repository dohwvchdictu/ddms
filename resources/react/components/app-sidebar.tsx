import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { navigation, type NavGroup, type NavItem } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import type { SidebarCounts } from '@/types';

interface AppSidebarProps {
    /** Icon-only rail (desktop). Ignored inside the mobile sheet. */
    collapsed?: boolean;
    onToggleCollapsed?: () => void;
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
        // Storage blocked: groups reset to open on the next page.
    }
}

function isActive(url: string, href: string): boolean {
    const path = url.split('?')[0];

    return path === href || path.startsWith(`${href}/`);
}

/** An Inertia link for React pages, a plain full-page link for Livewire ones. */
function NavLink({
    href,
    legacy,
    className,
    onNavigate,
    current,
    children,
}: {
    href: string;
    legacy?: boolean;
    className: string;
    onNavigate?: () => void;
    current?: boolean;
    children: ReactNode;
}) {
    const props = { href, className, onClick: onNavigate, 'aria-current': current ? ('page' as const) : undefined };

    return legacy ? <a {...props}>{children}</a> : <Link {...props}>{children}</Link>;
}

function CountBadge({ count }: { count: number }) {
    return count > 0 ? (
        <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[0.7rem] leading-none font-semibold text-white tabular-nums">
            {count}
        </span>
    ) : null;
}

/** Pulsing red dot over a group icon when something inside needs attention. */
function AttentionDot() {
    return (
        <span className="absolute -top-1 -right-1 flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-red-500 ring-2 ring-background" />
        </span>
    );
}

const rowBase =
    'group/row relative flex w-full items-center gap-3 rounded-lg px-2.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50';
const rowIdle = 'text-foreground/75 hover:bg-accent hover:text-foreground';
/** The active page: tinted row with a green bar on its left edge. */
const rowActive =
    'bg-emerald-100/70 font-medium text-emerald-800 before:absolute before:inset-y-1.5 before:-left-3 before:w-1 before:rounded-r-full before:bg-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300';

/** Wraps a single link in a hover label while the sidebar is an icon rail. */
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

export default function AppSidebar({ collapsed = false, onToggleCollapsed, onNavigate }: AppSidebarProps) {
    const { url, props } = usePage();
    const counts = props.sidebarCounts;
    const count = (key?: keyof SidebarCounts) => (key && counts ? counts[key] : 0);

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(readOpenGroups);
    /** Which group's pop-out menu is open in the rail. */
    const [flyout, setFlyout] = useState<string | null>(null);

    const groupActive = (group: NavGroup) =>
        group.href ? isActive(url, group.href) : (group.items ?? []).some((item) => isActive(url, item.href));

    // Open unless the user closed it; the group holding the current page always shows it.
    const isOpen = (group: NavGroup) => groupActive(group) || openGroups[group.title] !== false;

    const toggleGroup = (group: NavGroup) => {
        const next = { ...openGroups, [group.title]: !isOpen(group) };
        setOpenGroups(next);
        saveOpenGroups(next);
    };

    const groupIcon = (group: NavGroup, active: boolean) => {
        const Icon = group.icon;

        return (
            <span className="relative shrink-0">
                <Icon className={cn('size-[1.15rem]', active ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground group-hover/row:text-foreground')} />
                {count(group.dot) > 0 && <AttentionDot />}
            </span>
        );
    };

    const renderItem = (item: NavItem, inFlyout = false) => {
        const Icon = item.icon;
        const active = isActive(url, item.href);

        return (
            <li key={item.href}>
                <NavLink
                    href={item.href}
                    legacy={item.legacy}
                    current={active}
                    onNavigate={() => {
                        setFlyout(null);
                        onNavigate?.();
                    }}
                    className={cn(rowBase, 'h-8', active ? rowActive : rowIdle, inFlyout && 'before:hidden')}
                >
                    <Icon
                        className={cn(
                            'size-4 shrink-0',
                            active ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground group-hover/row:text-foreground',
                        )}
                    />
                    <span className="truncate">{item.title}</span>
                    <CountBadge count={count(item.badge)} />
                </NavLink>
            </li>
        );
    };

    const renderGroup = (group: NavGroup) => {
        const active = groupActive(group);

        // A single link (Dashboard).
        if (group.href) {
            return (
                <li key={group.title}>
                    <RailTip show={collapsed} label={group.title}>
                        <NavLink
                            href={group.href}
                            legacy={group.legacy}
                            current={active}
                            onNavigate={onNavigate}
                            className={cn(rowBase, 'h-9', collapsed && 'justify-center px-0', active ? rowActive : rowIdle)}
                        >
                            {groupIcon(group, active)}
                            {!collapsed && <span className="truncate">{group.title}</span>}
                        </NavLink>
                    </RailTip>
                </li>
            );
        }

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
                                {groupIcon(group, active)}
                            </button>
                        </HoverCardTrigger>
                        <HoverCardContent side="right" align="start" sideOffset={12} className="w-60 p-2">
                            <p className="px-2.5 pt-1 pb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                {group.title}
                            </p>
                            <ul className="space-y-0.5">{group.items?.map((item) => renderItem(item, true))}</ul>
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
                    {groupIcon(group, active)}
                    <span className="truncate">{group.title}</span>
                    <ChevronDown
                        className={cn('ml-auto size-4 text-muted-foreground transition-transform duration-200', open && 'rotate-180')}
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
                        <ul className="mt-0.5 ml-[1.15rem] space-y-0.5 border-l pl-2.5">{group.items?.map((item) => renderItem(item))}</ul>
                    </div>
                </div>
            </li>
        );
    };

    return (
        <nav aria-label="Main" className="flex h-full flex-col">
            {onToggleCollapsed && (
                <div className={cn('flex px-3 pt-3', collapsed ? 'justify-center' : 'justify-end')}>
                    <button
                        type="button"
                        onClick={onToggleCollapsed}
                        className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        aria-expanded={!collapsed}
                    >
                        {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
                    </button>
                </div>
            )}

            <div className="flex-1 overflow-x-hidden overflow-y-auto px-3 pb-4">
                {navigation.map((section, index) => (
                    <section key={section.title} aria-label={collapsed ? section.title : undefined}>
                        {collapsed ? (
                            index > 0 && <hr className="mx-2 my-3 border-border" />
                        ) : (
                            <h2 className="px-2.5 pt-4 pb-1.5 text-[0.7rem] font-semibold tracking-wider text-muted-foreground/80 uppercase">
                                {section.title}
                            </h2>
                        )}
                        <ul className="space-y-0.5">{section.groups.map(renderGroup)}</ul>
                    </section>
                ))}
            </div>
        </nav>
    );
}
