import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowDownToLine,
    ArrowUpRight,
    CircleHelp,
    Clock,
    FileInput,
    Hourglass,
    UserRoundCheck,
    type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import ActivityChart, { type ActivityPoint } from '@/components/dashboard/activity-chart';
import DeadlineBreakdown from '@/components/dashboard/deadline-breakdown';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { documents as documentsRoute } from '@/routes/dashboard';

interface Counts {
    for_action: number;
    pending: number;
    due_soon: number;
    due_today: number;
    overdue: number;
    on_track: number;
    total: number;
}

interface CardDef {
    label: string;
    icon: LucideIcon;
    accent: string;
    tile: string;
    tooltip: string;
}

/**
 * The user's own office queue, the same numbers as the sidebar badges. These
 * pages are still on Livewire, so the cards are full-page links.
 */
const OFFICE_CARDS: (CardDef & { key: 'incoming' | 'pending' | 'endorsed'; href: string })[] = [
    {
        key: 'incoming',
        label: 'Incoming',
        href: '/status-incoming',
        icon: ArrowDownToLine,
        accent: 'text-emerald-700 dark:text-emerald-400',
        tile: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
        tooltip: 'Sent to your office and waiting to be received (For Receiving and Returned).',
    },
    {
        key: 'pending',
        label: 'Pending',
        href: '/status-pending',
        icon: Hourglass,
        accent: 'text-emerald-700 dark:text-emerald-400',
        tile: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
        tooltip: 'Received by your office and still in process.',
    },
    {
        key: 'endorsed',
        label: 'Endorsed to me',
        href: '/status-endorsed',
        icon: UserRoundCheck,
        accent: 'text-emerald-700 dark:text-emerald-400',
        tile: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
        tooltip: 'In process at your office and endorsed to you.',
    },
];

/**
 * System-wide cards. The icon says which question a card answers: the
 * workflow cards say what the holding office must do next, the deadline cards
 * cut the same documents by how much time is left.
 *
 * Colour follows the same split. Workflow cards are cool (indigo, sky) — a
 * state, not a warning. Deadline cards climb one warm ramp, yellow to orange
 * to red, so urgency reads from the colour alone. Nothing warm appears outside
 * that ramp, or "For Action" would look like a deadline it has no part in.
 *
 * Light-mode label shades are the 700s, not the 500s: the label is small
 * uppercase text, and yellow-500 on white sits near 2:1 contrast.
 */
const SYSTEM_CARDS: (CardDef & { key: 'for_action' | 'pending' | 'due_soon' | 'due_today' | 'overdue' })[] = [
    {
        key: 'for_action',
        label: 'For Action',
        icon: FileInput,
        accent: 'text-indigo-700 dark:text-indigo-400',
        tile: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
        tooltip: 'Documents waiting to be received by their office (For Receiving and Returned).',
    },
    {
        key: 'pending',
        label: 'Pending',
        icon: FileInput,
        accent: 'text-sky-700 dark:text-sky-400',
        tile: 'bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400',
        tooltip: 'Documents already received and still in process (On Process and Endorsed).',
    },
    {
        key: 'due_soon',
        label: 'Due Soon',
        icon: Clock,
        accent: 'text-yellow-700 dark:text-yellow-400',
        tile: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400',
        tooltip: 'Deadline falls within the next 3 working days.',
    },
    {
        key: 'due_today',
        label: 'Due Today',
        icon: Clock,
        accent: 'text-orange-700 dark:text-orange-400',
        tile: 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400',
        tooltip: 'Deadline is today. Act on these before the day ends.',
    },
    {
        key: 'overdue',
        label: 'Overdue',
        icon: Clock,
        accent: 'text-red-700 dark:text-red-400',
        tile: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400',
        tooltip: 'Past the required days and still not acted upon.',
    },
];

const number = new Intl.NumberFormat('en-PH');
const today = new Intl.DateTimeFormat('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

const cardLinkClass =
    'group block rounded-xl outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring/50 [&>[data-slot=card]]:transition-colors hover:[&>[data-slot=card]]:border-emerald-500/40 hover:[&>[data-slot=card]]:shadow-md';

/** A count card that links to the documents behind it. */
function StatCard({ def, value, link }: { def: CardDef; value: number; link: (children: ReactNode) => ReactNode }) {
    const Icon = def.icon;

    return link(
        <Card className="h-full gap-3 p-4">
            <div className="flex items-center justify-between gap-2">
                <p className={cn('text-xs font-medium tracking-wide whitespace-nowrap uppercase', def.accent)}>{def.label}</p>
                <span className="flex items-center gap-1">
                    {/* The help icon sits inside a link, so it must not be a second
                        interactive element; the same text is the link's description. */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="text-muted-foreground" aria-hidden="true">
                                <CircleHelp className="size-4" />
                            </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-60">{def.tooltip}</TooltipContent>
                    </Tooltip>
                    <ArrowUpRight
                        className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                        aria-hidden="true"
                    />
                </span>
            </div>

            <div className="flex items-center justify-between gap-3">
                <p className="text-2xl font-semibold tabular-nums">{number.format(value)}</p>
                <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', def.tile)}>
                    <Icon className="size-5" aria-hidden="true" />
                </div>
            </div>
        </Card>,
    );
}

function SectionHeading({ id, title, description }: { id: string; title: string; description: string }) {
    return (
        <div className="mb-3">
            <h2 id={id} className="text-sm font-semibold">
                {title}
            </h2>
            <p className="text-xs text-muted-foreground">{description}</p>
        </div>
    );
}

export default function Dashboard({ counts, activity }: { counts: Counts; activity: ActivityPoint[] }) {
    const { auth, sidebarCounts } = usePage().props;
    const officeName = auth.user?.office?.name;

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
                <p className="text-sm text-muted-foreground">{today.format(new Date())}</p>
            </div>

            {sidebarCounts && (
                <section aria-labelledby="office-heading">
                    <SectionHeading id="office-heading" title="Your office" description={officeName ?? 'Documents waiting on your office'} />
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(13rem,1fr))] gap-4">
                        {OFFICE_CARDS.map((def) => (
                            <StatCard
                                key={def.key}
                                def={def}
                                value={sidebarCounts[def.key]}
                                link={(children) => (
                                    <a href={def.href} className={cardLinkClass} aria-description={def.tooltip}>
                                        {children}
                                    </a>
                                )}
                            />
                        ))}
                    </div>
                </section>
            )}

            <section aria-labelledby="system-heading">
                <SectionHeading id="system-heading" title="All documents" description="Open documents across DOH Western Visayas" />
                {/* Five across on a laptop with the sidebar open; wraps on narrower screens. */}
                <div className="grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-4">
                    {SYSTEM_CARDS.map((def) => (
                        <StatCard
                            key={def.key}
                            def={def}
                            value={counts[def.key]}
                            link={(children) => (
                                <Link
                                    href={documentsRoute({ query: { filter: def.key } })}
                                    className={cardLinkClass}
                                    aria-description={def.tooltip}
                                >
                                    {children}
                                </Link>
                            )}
                        />
                    ))}
                </div>
            </section>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <ActivityChart data={activity} />
                </div>
                <DeadlineBreakdown counts={counts} />
            </div>
        </AppLayout>
    );
}
