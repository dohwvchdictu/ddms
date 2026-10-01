import { ChartColumn, FilePlus2, House, Inbox, ListChecks, MessageSquare, type LucideIcon } from 'lucide-react';
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
    legacy?: boolean;
    /** Red badge count, read from the shared `sidebarCounts` prop. */
    badge?: keyof SidebarCounts;
}

export interface NavGroup {
    title: string;
    icon: LucideIcon;
    /** A group with an href is a single link; otherwise it opens `items`. */
    href?: string;
    legacy?: boolean;
    items?: NavItem[];
    /** Pulsing dot on the group icon when this count is above zero. */
    dot?: keyof SidebarCounts;
}

export const navigation: NavGroup[] = [
    { title: 'Dashboard', icon: House, href: '/dashboard' },
    {
        title: 'New Document',
        icon: FilePlus2,
        items: [{ title: 'Document', href: '/new-document', legacy: true }],
    },
    {
        title: 'Inbox',
        icon: Inbox,
        items: [
            { title: 'My Documents', href: '/my-documents', legacy: true },
            { title: 'My Purchase Requests', href: '/my-purchase-requests', legacy: true },
            { title: 'My Payments', href: '/my-payments', legacy: true },
            { title: 'Routing Logbook', href: '/routing-logbook', legacy: true },
        ],
    },
    {
        title: 'Status',
        icon: ListChecks,
        dot: 'total',
        items: [
            { title: 'Incoming', href: '/status-incoming', legacy: true, badge: 'incoming' },
            { title: 'Pending', href: '/status-pending', legacy: true, badge: 'pending' },
            { title: 'Endorsed', href: '/status-endorsed', legacy: true, badge: 'endorsed' },
            { title: 'Processed', href: '/status-forwarded', legacy: true },
            { title: 'Closed', href: '/status-closed', legacy: true },
        ],
    },
    {
        title: 'Reports',
        icon: ChartColumn,
        items: [
            { title: 'Status', href: '/report-status-of-documents', legacy: true },
            { title: 'Endorsements', href: '/report-status-per-employee', legacy: true },
            { title: 'External Requests', href: '/report-status-of-external-documents', legacy: true },
            { title: 'Internal Documents', href: '/report-status-of-internal-documents', legacy: true },
            { title: 'Per Unit', href: '/report-per-unit', legacy: true },
            { title: 'Turnaround Time', href: '/report-turnaround-time', legacy: true },
        ],
    },
    { title: 'Feedback', icon: MessageSquare, href: '#', legacy: true },
];
