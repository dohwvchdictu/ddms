/**
 * Every page in the app, React or not. While the migration is in progress a
 * `legacy` page is still served by Livewire, so links to it must do a full
 * page load instead of an Inertia visit. Drop the flag when a page moves to
 * React.
 */
export interface NavItem {
    title: string;
    href: string;
    legacy?: boolean;
}

export const navigation: NavItem[] = [
    { title: 'Dashboard', href: '/dashboard', legacy: true },
    { title: 'New Document', href: '/new-document', legacy: true },
    { title: 'New Bundle', href: '/new-bundle', legacy: true },
    { title: 'My Documents', href: '/my-documents', legacy: true },
    { title: 'My Bundles', href: '/my-bundles', legacy: true },
    { title: 'My Purchase Requests', href: '/my-purchase-requests', legacy: true },
    { title: 'My Payments', href: '/my-payments', legacy: true },
    { title: 'Incoming', href: '/status-incoming', legacy: true },
    { title: 'Pending', href: '/status-pending', legacy: true },
    { title: 'Endorsed', href: '/status-endorsed', legacy: true },
    { title: 'Forwarded', href: '/status-forwarded', legacy: true },
    { title: 'Closed', href: '/status-closed', legacy: true },
    { title: 'Routing Logbook', href: '/routing-logbook', legacy: true },
    { title: 'Status of Documents', href: '/report-status-of-documents', legacy: true },
    { title: 'Status per Employee', href: '/report-status-per-employee', legacy: true },
    { title: 'External Documents', href: '/report-status-of-external-documents', legacy: true },
    { title: 'Internal Documents', href: '/report-status-of-internal-documents', legacy: true },
    { title: 'Per Unit', href: '/report-per-unit', legacy: true },
    { title: 'Turnaround Time', href: '/report-turnaround-time', legacy: true },
];
