import { EllipsisVertical, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export interface RowMenuItem {
    label: string;
    icon: LucideIcon;
    onSelect: () => void;
}

/** A row's actions behind a ⋮ button, so the table stays uncluttered. */
export default function RowMenu({ label, items }: { label: string; items: RowMenuItem[] }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={label} title="More actions">
                    <EllipsisVertical />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                {items.map(({ label: itemLabel, icon: Icon, onSelect }) => (
                    <DropdownMenuItem key={itemLabel} onSelect={onSelect}>
                        <Icon />
                        {itemLabel}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
