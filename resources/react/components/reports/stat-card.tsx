import { CircleHelp, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface StatCardProps {
    label: string;
    /** Already formatted: "1,204", "87.21%", "—". */
    value: string;
    icon: LucideIcon;
    /** Classes for the icon's tile: its colour says what the figure is. */
    tile: string;
    /** What the figure counts, behind the help icon. */
    tooltip: string;
    /** Red figure: something needs attention (e.g. overdue). */
    alert?: boolean;
}

/** One headline figure of a report, in the dashboard's card style. */
export default function StatCard({ label, value, icon: Icon, tile, tooltip, alert = false }: StatCardProps) {
    return (
        <Card className="gap-3 p-4">
            <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium tracking-wide whitespace-nowrap text-muted-foreground uppercase">{label}</p>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button type="button" className="text-muted-foreground hover:text-foreground" aria-label={`About ${label}`}>
                            <CircleHelp className="size-4" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-64">{tooltip}</TooltipContent>
                </Tooltip>
            </div>
            <div className="flex items-center justify-between gap-3">
                <p className={cn('text-2xl font-semibold tabular-nums', alert && 'text-red-600 dark:text-red-400')}>{value}</p>
                <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', tile)}>
                    <Icon className="size-5" aria-hidden="true" />
                </div>
            </div>
        </Card>
    );
}
