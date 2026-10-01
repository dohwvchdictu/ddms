import { Head } from '@inertiajs/react';
import { ChevronRight, CircleHelp, Clock, FileInput, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';

interface Counts {
    for_action: number;
    pending: number;
    due_soon: number;
    due_today: number;
    overdue: number;
    on_track: number;
    total: number;
}

/**
 * One definition per card. The icon says which question a card answers: the
 * workflow cards say what the office must do next, the deadline cards cut the
 * same documents by how much time is left.
 *
 * Colour follows the same split. Workflow cards are cool (indigo, sky) — a
 * state, not a warning. Deadline cards climb one warm ramp, yellow to orange
 * to red, so urgency reads from the colour alone. Nothing warm appears outside
 * that ramp, or "For Action" would look like a deadline it has no part in.
 *
 * Light-mode label shades are the 700s, not the 500s: the label is small
 * uppercase text, and yellow-500 on white sits near 2:1 contrast.
 */
const CARDS: { key: keyof Counts; label: string; icon: LucideIcon; accent: string; tile: string; tooltip: string }[] = [
    {
        key: 'for_action',
        label: 'For Action',
        icon: FileInput,
        accent: 'text-indigo-700 dark:text-indigo-400',
        tile: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
        tooltip: 'Documents waiting to be received by your office (For Receiving and Returned).',
    },
    {
        key: 'pending',
        label: 'Pending',
        icon: FileInput,
        accent: 'text-sky-700 dark:text-sky-400',
        tile: 'bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400',
        tooltip: 'Documents already received and still in process at your office (On Process and Endorsed).',
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

export default function Dashboard({ counts }: { counts: Counts }) {
    return (
        <AppLayout>
            <Head title="Dashboard" />

            <nav aria-label="Breadcrumb">
                <ol className="flex items-center text-sm whitespace-nowrap">
                    <li className="flex items-center text-muted-foreground">
                        Home
                        <ChevronRight className="mx-2 size-4" aria-hidden="true" />
                    </li>
                    <li className="truncate font-semibold" aria-current="page">
                        Dashboard
                    </li>
                </ol>
            </nav>

            {/* Five across on a laptop with the sidebar open; wraps on narrower screens. */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-4">
                {CARDS.map(({ key, label, icon: Icon, accent, tile, tooltip }) => (
                    <Card key={key} className="gap-3 p-4">
                        <div className="flex items-center justify-between gap-2">
                            <p className={cn('text-xs font-medium tracking-wide whitespace-nowrap uppercase', accent)}>{label}</p>
                            <Tooltip>
                                <TooltipTrigger
                                    className="rounded-full text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                                    aria-label={`About ${label}`}
                                >
                                    <CircleHelp className="size-4" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-60">{tooltip}</TooltipContent>
                            </Tooltip>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                            <p className="text-2xl font-semibold tabular-nums">{number.format(counts[key])}</p>
                            <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', tile)}>
                                <Icon className="size-5" aria-hidden="true" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </AppLayout>
    );
}
