import { usePage } from '@inertiajs/react';
import { CircleAlert } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import AppHeader from '@/components/app-header';
import AppSidebar from '@/components/app-sidebar';
import Breadcrumbs, { type Crumb } from '@/components/breadcrumbs';
import SearchDialog from '@/components/search-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

/** Same key as the Livewire layout, so the choice carries across both. */
const COLLAPSED_KEY = 'sidebarCollapsed';

/** Tailwind's `lg` breakpoint, where the sidebar is always on screen. */
const DESKTOP_QUERY = '(min-width: 64rem)';

function readCollapsed(): boolean {
    try {
        return localStorage.getItem(COLLAPSED_KEY) === '1';
    } catch {
        return false;
    }
}

/**
 * The signed-in app shell: fixed green header, sidebar (an icon rail when
 * collapsed on desktop, a slide-in sheet on mobile) and the page content.
 */
export default function AppLayout({ children, breadcrumbs }: { children: ReactNode; breadcrumbs?: Crumb[] }) {
    const { flash } = usePage().props;
    const [collapsed, setCollapsed] = useState(readCollapsed);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    const toggleCollapsed = () => {
        setCollapsed((value) => {
            try {
                localStorage.setItem(COLLAPSED_KEY, value ? '0' : '1');
            } catch {
                // Storage blocked: the choice lasts for this page view only.
            }

            return !value;
        });
    };

    // "/" opens search from anywhere except while typing in a field.
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            const typing = target?.closest('input, textarea, select, [contenteditable="true"]');

            if (event.key === '/' && !typing && !event.ctrlKey && !event.metaKey && !event.altKey) {
                event.preventDefault();
                setSearchOpen(true);
            }
        };

        document.addEventListener('keydown', onKeyDown);

        return () => document.removeEventListener('keydown', onKeyDown);
    }, []);

    return (
        <div className="min-h-dvh bg-muted/40">
            <AppHeader
                onOpenSearch={() => setSearchOpen(true)}
                // Same button everywhere: it folds the sidebar to an icon rail on
                // desktop, and opens the slide-in menu where there is no sidebar.
                onToggleSidebar={() => (window.matchMedia(DESKTOP_QUERY).matches ? toggleCollapsed() : setMobileOpen(true))}
                sidebarExpanded={!collapsed}
            />

            <aside
                className={cn(
                    'fixed top-16 bottom-0 left-0 z-30 hidden border-r bg-background transition-[width] duration-200 lg:block',
                    collapsed ? 'w-16' : 'w-64',
                )}
            >
                <AppSidebar collapsed={collapsed} />
            </aside>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetContent side="left" className="w-72 p-0">
                    <SheetTitle className="sr-only">Navigation</SheetTitle>
                    <SheetDescription className="sr-only">Main menu</SheetDescription>
                    <div className="h-full pt-10">
                        <AppSidebar onNavigate={() => setMobileOpen(false)} />
                    </div>
                </SheetContent>
            </Sheet>

            <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

            <main className={cn('pt-16 transition-[padding] duration-200', collapsed ? 'lg:pl-16' : 'lg:pl-64')}>
                {/* With breadcrumbs, they sit right under the header with a rule below,
                    where the Livewire pages have them, so both kinds of page line up. */}
                <div className={cn('mx-auto max-w-[85rem] space-y-6 p-4 sm:p-6 lg:p-8', breadcrumbs && 'lg:pt-1.5')}>
                    {breadcrumbs && (
                        <div className="space-y-4 sm:space-y-6">
                            <Breadcrumbs items={breadcrumbs} />
                            <hr className="border-border" />
                        </div>
                    )}
                    {flash.error && (
                        <Alert variant="destructive">
                            <CircleAlert />
                            <AlertDescription>{flash.error}</AlertDescription>
                        </Alert>
                    )}
                    {children}
                </div>
            </main>
        </div>
    );
}
