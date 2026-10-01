import { router } from '@inertiajs/react';
import { LogOut, Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme, type Theme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';
import type { User } from '@/types';

const THEMES: { value: Theme; label: string; icon: LucideIcon }[] = [
    { value: 'light', label: 'Light theme', icon: Sun },
    { value: 'dark', label: 'Dark theme', icon: Moon },
    { value: 'system', label: 'Use system theme', icon: Monitor },
];

function initials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
}

/** The avatar button and its menu: who is signed in, theme, logout. */
export default function UserMenu({ user }: { user: User }) {
    const { theme, setTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-700"
                aria-label="Open user menu"
            >
                <Avatar className="size-9 ring-2 ring-white/40">
                    <AvatarImage src={user.photo} alt="" />
                    <AvatarFallback className="bg-emerald-900 text-xs text-white">{initials(user.name)}</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" sideOffset={8} className="w-64">
                <DropdownMenuLabel className="font-normal">
                    <p className="text-xs text-muted-foreground">Signed in as</p>
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    {user.office?.name && <p className="truncate text-xs text-muted-foreground">{user.office.name}</p>}
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {/* Icons only; plain buttons rather than menu items so picking a
                    theme leaves the menu open and shows the change. */}
                <div role="radiogroup" aria-label="Theme" className="flex gap-1 p-1">
                    {THEMES.map(({ value, label, icon: Icon }) => (
                        <button
                            key={value}
                            type="button"
                            role="radio"
                            aria-checked={theme === value}
                            aria-label={label}
                            title={label}
                            onClick={() => setTheme(value)}
                            className={cn(
                                'flex h-8 flex-1 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50',
                                theme === value && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                            )}
                        >
                            <Icon className="size-4" />
                        </button>
                    ))}
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem onSelect={() => router.visit(logout())}>
                    <LogOut />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
