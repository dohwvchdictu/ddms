import {
    Archive,
    BookOpen,
    Building2,
    ChartColumn,
    ClipboardList,
    FilePlus2,
    Files,
    FileText,
    Globe,
    Hourglass,
    House,
    Inbox,
    ListChecks,
    Network,
    Send,
    ShoppingCart,
    Timer,
    UserRoundCheck,
    Wallet,
    ArrowDownToLine,
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

export interface NavSection {
    title: string;
    groups: NavGroup[];
}

export const navigation: NavSection[] = [
    {
        title: 'Main',
        groups: [
            { title: 'Dashboard', icon: House, href: '/dashboard' },
            {
                title: 'New Document',
                icon: FilePlus2,
                items: [{ title: 'Document', href: '/new-document', icon: FileText, legacy: true }],
            },
        ],
    },
    {
        title: 'Documents',
        groups: [
            {
                title: 'Inbox',
                icon: Inbox,
                items: [
                    { title: 'My Documents', href: '/my-documents', icon: Files, legacy: true },
                    { title: 'My Purchase Requests', href: '/my-purchase-requests', icon: ShoppingCart, legacy: true },
                    { title: 'My Payments', href: '/my-payments', icon: Wallet, legacy: true },
                    { title: 'Routing Logbook', href: '/routing-logbook', icon: BookOpen, legacy: true },
                ],
            },
            {
                title: 'Status',
                icon: ListChecks,
                dot: 'total',
                items: [
                    { title: 'Incoming', href: '/status-incoming', icon: ArrowDownToLine, legacy: true, badge: 'incoming' },
                    { title: 'Pending', href: '/status-pending', icon: Hourglass, legacy: true, badge: 'pending' },
                    { title: 'Endorsed', href: '/status-endorsed', icon: UserRoundCheck, legacy: true, badge: 'endorsed' },
                    { title: 'Processed', href: '/status-forwarded', icon: Send, legacy: true },
                    { title: 'Closed', href: '/status-closed', icon: Archive, legacy: true },
                ],
            },
        ],
    },
    {
        title: 'Reports',
        groups: [
            {
                title: 'Reports',
                icon: ChartColumn,
                items: [
                    { title: 'Status', href: '/report-status-of-documents', icon: ClipboardList, legacy: true },
                    { title: 'Endorsements', href: '/report-status-per-employee', icon: UserRoundCheck, legacy: true },
                    { title: 'External Requests', href: '/report-status-of-external-documents', icon: Globe, legacy: true },
                    { title: 'Internal Documents', href: '/report-status-of-internal-documents', icon: Building2, legacy: true },
                    { title: 'Per Unit', href: '/report-per-unit', icon: Network, legacy: true },
                    { title: 'Turnaround Time', href: '/report-turnaround-time', icon: Timer, legacy: true },
                ],
            },
        ],
    },
];
