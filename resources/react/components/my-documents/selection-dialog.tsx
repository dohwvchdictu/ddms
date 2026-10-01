import { X } from 'lucide-react';
import type { DocumentRow } from '@/components/my-documents/types';
import StatusBadge from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface SelectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    items: DocumentRow[];
    onRemove: (id: number) => void;
    onClear: () => void;
}

const dateFormat = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

/**
 * Review what is queued before acting. The selection outlives searches and
 * pages, so it often holds documents that are not on screen.
 */
export default function SelectionDialog({ open, onOpenChange, items, onRemove, onClear }: SelectionDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-0 p-0 sm:max-w-2xl">
                <DialogHeader className="border-b px-6 py-4">
                    <DialogTitle>Selected documents</DialogTitle>
                    <DialogDescription>{items.length} selected, newest pick first.</DialogDescription>
                </DialogHeader>

                {items.length === 0 ? (
                    <p className="px-6 py-10 text-center text-sm text-muted-foreground">Nothing is selected.</p>
                ) : (
                    <ul className="max-h-[60vh] divide-y overflow-y-auto">
                        {items.map((item) => (
                            <li key={item.id} className="flex items-start justify-between gap-3 px-6 py-3">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">{item.control_no}</span>
                                        <StatusBadge status={item.status} />
                                    </div>
                                    <p className="mt-1 truncate text-sm">{item.subject}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {item.classification}
                                        {item.created_at && ` · ${dateFormat.format(new Date(item.created_at))}`}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => onRemove(item.id)}
                                    aria-label={`Remove ${item.control_no} from the selection`}
                                    className="shrink-0 hover:bg-destructive/10 hover:text-destructive"
                                >
                                    <X />
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}

                <DialogFooter className="border-t px-6 py-4">
                    <Button variant="outline" onClick={onClear} disabled={items.length === 0}>
                        Clear all
                    </Button>
                    <Button onClick={() => onOpenChange(false)} className="bg-emerald-600 text-white hover:bg-emerald-700">
                        Done
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
