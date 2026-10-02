import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: ReactNode;
    confirmLabel: string;
    onConfirm: () => void;
    /** Red confirm button, for actions that can't be undone. */
    destructive?: boolean;
    /** Shows a spinner and blocks closing while the action runs. */
    busy?: boolean;
}

/** "Are you sure?" before an action that changes or removes something. */
export default function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel, onConfirm, destructive = false, busy = false }: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
            <DialogContent showCloseButton={false} className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={busy}
                        variant={destructive ? 'destructive' : 'default'}
                        className={destructive ? undefined : 'bg-emerald-600 text-white hover:bg-emerald-700'}
                    >
                        {busy && <Loader2 className="animate-spin" />}
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
