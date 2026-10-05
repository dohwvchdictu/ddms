import {
    Archive,
    ArrowDownToLine,
    BookOpen,
    ChartColumn,
    CircleCheckBig,
    ClipboardList,
    FilePlus2,
    Files,
    FolderOpen,
    Globe,
    Hourglass,
    House,
    Inbox,
    Network,
    Send,
    Timer,
    UserRoundCheck,
    type LucideIcon,
} from 'lucide-react';
import type { SidebarCounts } from '@/types';

/**
 * The sidebar menu, React pages and Livewire pages alike. While the migration
 * is in progress a `legacy` page is still served by Livewire, so links to it
 * must do a full page load instead of an Inertia visit. Drop the flag when a
 * page moves to React.
 */
export interface NavItem {
    title: string;
    href: string;
    icon: LucideIcon;
    legacy?: boolean;
    /** Red badge count, read from the shared `sidebarCounts` prop. */
    badge?: keyof SidebarCounts;
}

/** A collapsible set of pages. */
export interface NavGroup {
    title: string;
    icon: LucideIcon;
    items: NavItem[];
    /** Whether it starts open before the user has opened or closed it. */
    defaultOpen?: boolean;
    /** Count shown on the group header while it is closed (and on the rail icon). */
    badge?: keyof SidebarCounts;
}

/** Links shown above the New Document button. */
export const primary: NavItem[] = [{ title: 'Dashboard', href: '/dashboard', icon: House }];

/** The main call to action, shown as a green button. */
export const newDocument: NavItem = { title: 'New Document', href: '/new-document', icon: FilePlus2 };

export const groups: NavGroup[] = [
    {
        // Documents waiting on the user's office. `total` rather than the sum of
        // the rows, so a document counts once. "Endorsed to me" is Pending's To me switch.
        title: 'Inbox',
        icon: Inbox,
        defaultOpen: true,
        badge: 'total',
        items: [
            { title: 'Incoming', href: '/status-incoming', icon: ArrowDownToLine, badge: 'incoming' },
            { title: 'Pending', href: '/status-pending', icon: Hourglass, badge: 'pending' },
        ],
    },
    {
        // The counterpart to Inbox: what the office encoded and sends out.
        // Purchase requests and payments are tabs on My Documents.
        title: 'Outbox',
        icon: FolderOpen,
        defaultOpen: true,
        items: [
            { title: 'My Documents', href: '/my-documents', icon: Files },
            { title: 'Routing Logbook', href: '/routing-logbook', icon: BookOpen },
        ],
    },
    {
        title: 'Archive',
        icon: Archive,
        defaultOpen: false,
        items: [
            { title: 'Processed', href: '/status-forwarded', icon: Send },
            { title: 'Closed', href: '/status-closed', icon: CircleCheckBig },
        ],
    },
    {
        title: 'Reports',
        icon: ChartColumn,
        defaultOpen: false,
        items: [
            { title: 'Status', href: '/report-status-of-documents', icon: ClipboardList },
            { title: 'Endorsements', href: '/report-status-per-employee', icon: UserRoundCheck },
            { title: 'External Requests', href: '/report-status-of-external-documents', icon: Globe },
            { title: 'Per Unit', href: '/report-per-unit', icon: Network, legacy: true },
            { title: 'Turnaround Time', href: '/report-turnaround-time', icon: Timer, legacy: true },
        ],
    },
];

/** The menu item a URL belongs to (the page itself or one under it), for page titles to borrow its icon. */
export function findNavItem(url: string): NavItem | undefined {
    const path = url.split('?')[0];
    const items = [...primary, newDocument, ...groups.flatMap((group) => group.items)];

    return items.find((item) => path === item.href || path.startsWith(`${item.href}/`));
}
