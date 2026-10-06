import {
    ArchiveIcon,
    ChartBarIcon,
    ChartPieSliceIcon,
    CheckCircleIcon,
    ClipboardTextIcon,
    FilePlusIcon,
    FlowArrowIcon,
    FolderUserIcon,
    GearSixIcon,
    GlobeIcon,
    HourglassMediumIcon,
    HouseIcon,
    NotebookIcon,
    ScrollIcon,
    ShareFatIcon,
    TagIcon,
    TimerIcon,
    TrayArrowDownIcon,
    TrayArrowUpIcon,
    TrayIcon,
    UserCheckIcon,
    type Icon,
} from '@phosphor-icons/react';
import type { SidebarCounts } from '@/types';

/** The sidebar menu. */
export interface NavItem {
    title: string;
    href: string;
    /** Bold outline normally, filled while it is the current page. */
    icon: Icon;
    /** Red badge count, read from the shared `sidebarCounts` prop. */
    badge?: keyof SidebarCounts;
}

/** A collapsible set of pages. */
export interface NavGroup {
    title: string;
    /** Always shown filled. */
    icon: Icon;
    items: NavItem[];
    /** Whether it starts open before the user has opened or closed it. */
    defaultOpen?: boolean;
    /** Count shown on the group header while it is closed (and on the rail icon). */
    badge?: keyof SidebarCounts;
    /** Shown only to those allowed: `administer` = the shared `auth.canAdminister`. */
    requires?: 'administer';
}

/** Links shown above the New Document button. */
export const primary: NavItem[] = [{ title: 'Dashboard', href: '/dashboard', icon: HouseIcon }];

/** The main call to action, shown as a green button. */
export const newDocument: NavItem = { title: 'New Document', href: '/new-document', icon: FilePlusIcon };

export const groups: NavGroup[] = [
    {
        // Documents waiting on the user's office. `total` rather than the sum of
        // the rows, so a document counts once. "Endorsed to me" is Pending's To me switch.
        title: 'Inbox',
        icon: TrayIcon,
        defaultOpen: true,
        badge: 'total',
        items: [
            { title: 'Incoming', href: '/status-incoming', icon: TrayArrowDownIcon, badge: 'incoming' },
            { title: 'Pending', href: '/status-pending', icon: HourglassMediumIcon, badge: 'pending' },
        ],
    },
    {
        // The counterpart to Inbox: what the office encoded and sends out.
        // Purchase requests and payments are tabs on My Documents.
        title: 'Outbox',
        icon: TrayArrowUpIcon,
        defaultOpen: true,
        items: [
            { title: 'My Documents', href: '/my-documents', icon: FolderUserIcon },
            { title: 'Routing Logbook', href: '/routing-logbook', icon: NotebookIcon },
        ],
    },
    {
        title: 'Archive',
        icon: ArchiveIcon,
        defaultOpen: false,
        items: [
            { title: 'Processed', href: '/status-forwarded', icon: ShareFatIcon },
            { title: 'Closed', href: '/status-closed', icon: CheckCircleIcon },
        ],
    },
    {
        title: 'Reports',
        icon: ChartBarIcon,
        defaultOpen: false,
        items: [
            { title: 'Status of Documents', href: '/report-status-of-documents', icon: ClipboardTextIcon },
            { title: 'Endorsements', href: '/report-status-per-employee', icon: UserCheckIcon },
            { title: 'External Requests', href: '/report-status-of-external-documents', icon: GlobeIcon },
            { title: 'Per Category', href: '/report-per-unit', icon: ChartPieSliceIcon },
            { title: 'Turnaround Time', href: '/report-turnaround-time', icon: TimerIcon },
        ],
    },
    {
        // Reference data the workflow runs on. Only for allowed employees (until roles exist).
        title: 'Administration',
        icon: GearSixIcon,
        defaultOpen: false,
        requires: 'administer',
        items: [
            { title: 'Categories', href: '/admin/categories', icon: TagIcon },
            { title: "Citizen's Charter", href: '/admin/citizen-charters', icon: ScrollIcon },
            { title: 'Actions', href: '/admin/actions', icon: FlowArrowIcon },
        ],
    },
];

/** The menu item a URL belongs to (the page itself or one under it), for page titles to borrow its icon. */
export function findNavItem(url: string): NavItem | undefined {
    const path = url.split('?')[0];
    const items = [...primary, newDocument, ...groups.flatMap((group) => group.items)];

    return items.find((item) => path === item.href || path.startsWith(`${item.href}/`));
}
