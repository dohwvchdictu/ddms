import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ViewOptionsProps {
    /** Columns that can be hidden; the key column stays out of this list. */
    columns: { id: string; label: string }[];
    isVisible: (id: string) => boolean;
    onToggleColumn: (id: string, visible: boolean) => void;
    dense: boolean;
    onDenseChange: (dense: boolean) => void;
    perPage: number;
    perPageOptions: number[];
    onPerPageChange: (perPage: number) => void;
}

/** A "View" menu: which columns show, row density, and rows per page. */
export default function ViewOptions({ columns, isVisible, onToggleColumn, dense, onDenseChange, perPage, perPageOptions, onPerPageChange }: ViewOptionsProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                    <Settings2 />
                    View
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Columns</DropdownMenuLabel>
                {columns.map((column) => (
                    <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={isVisible(column.id)}
                        onCheckedChange={(checked) => onToggleColumn(column.id, checked === true)}
                        // Keep the menu open while ticking several.
                        onSelect={(event) => event.preventDefault()}
                    >
                        {column.label}
                    </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked={dense} onCheckedChange={(checked) => onDenseChange(checked === true)} onSelect={(event) => event.preventDefault()}>
                    Compact rows
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Rows per page</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={String(perPage)} onValueChange={(value) => onPerPageChange(Number(value))}>
                    {perPageOptions.map((option) => (
                        <DropdownMenuRadioItem key={option} value={String(option)}>
                            {option}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
