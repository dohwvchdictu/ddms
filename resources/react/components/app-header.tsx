import { Link, usePage } from '@inertiajs/react';
import { Menu, Search } from 'lucide-react';
import UserMenu from '@/components/user-menu';
import { dashboard } from '@/routes';

interface AppHeaderProps {
    onOpenSearch: () => void;
    onOpenSidebar: () => void;
}

/**
 * The fixed green bar across the top: seals and system name on the left,
 * search in the middle, greeting and user menu on the right.
 */
export default function AppHeader({ onOpenSearch, onOpenSidebar }: AppHeaderProps) {
    const { auth } = usePage().props;
    const user = auth.user;

    return (
        <header className="fixed inset-x-0 top-0 z-40 h-16 bg-emerald-700 text-white shadow-sm dark:bg-emerald-900">
            <div className="flex h-full items-center gap-3 px-3 sm:px-4">
                <button
                    type="button"
                    onClick={onOpenSidebar}
                    className="flex size-9 shrink-0 items-center justify-center rounded-md hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none lg:hidden"
                    aria-label="Open navigation"
                >
                    <Menu className="size-5" />
                </button>

                <Link href={dashboard()} className="flex min-w-0 shrink-0 items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-white/70">
                    <img src="/img/doh.png" alt="Department of Health" className="size-10 shrink-0" />
                    <img src="/img/bagongpilipinas.png" alt="Bagong Pilipinas" className="size-10 shrink-0 scale-[1.2]" />

                    {/* Divider between the seals and the system name. */}
                    <span aria-hidden="true" className="mx-1 h-10 w-px shrink-0 bg-white/50" />

                    {/* Three evenly spaced rows: a fixed line height per row and
                        the same gap between them, so the small caps don't sit
                        closer together than the title below them. */}
                    <span className="hidden min-w-0 gap-1 lg:grid">
                        <span className="text-[0.7rem] leading-3 font-semibold tracking-wide text-white uppercase">
                            Department of Health
                        </span>
                        <span className="text-[0.6rem] leading-3 tracking-wide text-white uppercase">
                            Western Visayas Center for Health Development
                        </span>
                        <span className="text-base leading-5 font-bold tracking-tight xl:text-lg xl:leading-6">
                            Digital Document Management System
                        </span>
                    </span>
                    <span className="grid gap-1 lg:hidden">
                        <span className="text-[0.7rem] leading-3 font-semibold tracking-wide text-white uppercase">DOH</span>
                        <span className="text-[0.6rem] leading-3 tracking-wide text-white uppercase">WVCHD</span>
                        <span className="text-base leading-5 font-bold tracking-tight">DDMS</span>
                    </span>
                </Link>

                <div className="flex flex-1 justify-center px-2">
                    <button
                        type="button"
                        onClick={onOpenSearch}
                        className="group hidden h-10 w-full max-w-lg items-center gap-2.5 rounded-lg border border-white/20 bg-white/10 px-3 text-sm text-white/75 shadow-inner shadow-black/5 transition-colors hover:border-white/30 hover:bg-white/15 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none sm:flex"
                    >
                        <Search className="size-4 shrink-0" aria-hidden="true" />
                        <span className="flex-1 truncate text-left">Search by subject or control number…</span>
                        <kbd className="flex h-5 min-w-5 items-center justify-center rounded border border-white/25 bg-white/10 px-1.5 text-xs font-semibold text-white/80 group-hover:text-white">
                            /
                        </kbd>
                    </button>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                    <button
                        type="button"
                        onClick={onOpenSearch}
                        className="flex size-9 items-center justify-center rounded-md hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none sm:hidden"
                        aria-label="Search documents"
                    >
                        <Search className="size-5" />
                    </button>

                    {user && (
                        <>
                            <span className="hidden text-sm whitespace-nowrap md:inline">
                                Hi, <span className="font-semibold">{user.firstName}</span>
                            </span>
                            <UserMenu user={user} />
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
