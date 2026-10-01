import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useState, type ReactNode } from 'react';
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

function isActive(url: string, href: string): boolean {
    const path = url.split('?')[0];

    return href !== '#' && (path === href || path.startsWith(`${href}/`));
}

/** An Inertia link for React pages, a plain full-page link for Livewire ones. */
function NavLink({
    href,
    legacy,
    className,
    onNavigate,
    children,
}: {
    href: string;
    legacy?: boolean;
    className: string;
    onNavigate?: () => void;
    children: ReactNode;
}) {
    return legacy ? (
        <a href={href} className={className} onClick={onNavigate}>
            {children}
        </a>
    ) : (
        <Link href={href} className={className} onClick={onNavigate}>
            {children}
        </Link>
    );
}

function CountBadge({ count }: { count: number }) {
    return count > 0 ? (
        <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs leading-none font-medium text-white">
            {count}
        </span>
    ) : null;
}

const rowClass =
    'flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50';
const idleClass = 'text-foreground/80 hover:bg-accent hover:text-accent-foreground';
const activeClass = 'bg-emerald-600 text-white hover:bg-emerald-600 hover:text-white';

/** Wraps a row in a hover label while the sidebar is an icon rail. */
function RailTip({ show, label, children }: { show: boolean; label: string; children: ReactNode }) {
    if (!show) {
        return <>{children}</>;
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
    );
}

export default function AppSidebar({ collapsed = false, onToggleCollapsed, onNavigate }: AppSidebarProps) {
    const { url, props } = usePage();
    const counts = props.sidebarCounts;
    const count = (key?: keyof SidebarCounts) => (key && counts ? counts[key] : 0);

    // Groups start open, like the Livewire sidebar's always-open accordion.
    const [closed, setClosed] = useState<Record<string, boolean>>({});

    const toggleGroup = (group: NavGroup) => {
        // In the rail the children are hidden, so a group icon expands the
        // sidebar instead (and opens the group).
        if (collapsed) {
            onToggleCollapsed?.();
            setClosed((state) => ({ ...state, [group.title]: false }));
            return;
        }

        setClosed((state) => ({ ...state, [group.title]: !state[group.title] }));
    };

    const renderItem = (item: NavItem) => (
        <li key={item.href}>
            <NavLink
                href={item.href}
                legacy={item.legacy}
                onNavigate={onNavigate}
                className={cn(rowClass, 'py-1.5 pl-9', isActive(url, item.href) ? activeClass : idleClass)}
            >
                <span className="truncate">{item.title}</span>
                <CountBadge count={count(item.badge)} />
            </NavLink>
        </li>
    );

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

            <ul className="flex-1 space-y-1 overflow-y-auto p-3">
                {navigation.map((group) => {
                    const Icon = group.icon;
                    const groupActive = group.href
                        ? isActive(url, group.href)
                        : (group.items ?? []).some((item) => isActive(url, item.href));
                    const dot = count(group.dot) > 0;
                    const icon = (
                        <span className="relative shrink-0">
                            <Icon className="size-4" />
                            {dot && (
                                <span className="absolute -top-1 -left-1 flex size-2.5">
                                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
                                    <span className="relative inline-flex size-2.5 rounded-full bg-red-500" />
                                </span>
                            )}
                        </span>
                    );

                    if (group.href) {
                        return (
                            <li key={group.title}>
                                <RailTip show={collapsed} label={group.title}>
                                    <NavLink
                                        href={group.href}
                                        legacy={group.legacy}
                                        onNavigate={onNavigate}
                                        className={cn(rowClass, collapsed && 'justify-center', groupActive ? activeClass : idleClass)}
                                    >
                                        {icon}
                                        {!collapsed && <span className="truncate">{group.title}</span>}
                                    </NavLink>
                                </RailTip>
                            </li>
                        );
                    }

                    const open = !collapsed && !closed[group.title];

                    return (
                        <li key={group.title}>
                            <RailTip show={collapsed} label={group.title}>
                                <button
                                    type="button"
                                    onClick={() => toggleGroup(group)}
                                    aria-expanded={open}
                                    className={cn(
                                        rowClass,
                                        collapsed && 'justify-center',
                                        collapsed && groupActive ? activeClass : idleClass,
                                    )}
                                >
                                    {icon}
                                    {!collapsed && (
                                        <>
                                            <span className="truncate">{group.title}</span>
                                            <ChevronDown
                                                className={cn('ml-auto size-4 transition-transform', open && 'rotate-180')}
                                                aria-hidden="true"
                                            />
                                        </>
                                    )}
                                </button>
                            </RailTip>

                            {open && <ul className="mt-1 space-y-0.5">{group.items?.map(renderItem)}</ul>}
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
