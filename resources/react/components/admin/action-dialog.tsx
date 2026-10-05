import { useForm } from '@inertiajs/react';
import { Check, Loader2 } from 'lucide-react';
import { useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { store } from '@/routes/admin/actions';

/**
 * The colour indicators an action may have, written out in full so Tailwind
 * builds them. Keep in step with ActionController::COLORS.
 */
export const COLORS = [
    'bg-gray-100',
    'bg-red-100',
    'bg-orange-100',
    'bg-amber-100',
    'bg-yellow-100',
    'bg-emerald-100',
    'bg-teal-100',
    'bg-cyan-100',
    'bg-sky-100',
    'bg-indigo-100',
    'bg-violet-100',
    'bg-pink-100',
] as const;

const Required = () => (
    <span className="text-destructive" aria-hidden="true">
        *
    </span>
);

/** Add an action (a step routing can be logged with): its name and colour indicator. */
export default function ActionDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
    const form = useForm({ name: '', color: '' });
    const { data, errors, processing } = form;

    useEffect(() => {
        if (!open) return;

        form.reset();
        form.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.submit(store(), { preserveScroll: true, onSuccess: () => onClose() });
    };

    return (
        <Dialog open={open} onOpenChange={(next) => !next && !processing && onClose()}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={submit} noValidate className="grid gap-5">
                    <DialogHeader>
                        <DialogTitle>Add action</DialogTitle>
                        <DialogDescription>Actions can't be renamed or removed once added, so check the name.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-2">
                        <Label htmlFor="action-name">
                            Description <Required />
                        </Label>
                        <Input
                            id="action-name"
                            value={data.name}
                            onChange={(event) => form.setData('name', event.target.value)}
                            maxLength={255}
                            required
                            aria-invalid={!!errors.name || undefined}
                            autoFocus
                        />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label id="action-color-label">
                            Color Indicator <Required />
                        </Label>
                        <div role="radiogroup" aria-labelledby="action-color-label" className="flex flex-wrap gap-2">
                            {COLORS.map((color) => {
                                const on = data.color === color;

                                return (
                                    <button
                                        key={color}
                                        type="button"
                                        role="radio"
                                        aria-checked={on}
                                        aria-label={color}
                                        title={color}
                                        onClick={() => form.setData('color', color)}
                                        className={cn(
                                            'flex size-9 items-center justify-center rounded-md border outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                                            color,
                                            on && 'ring-2 ring-emerald-600 ring-offset-2 ring-offset-background',
                                        )}
                                    >
                                        {on && <Check className="size-4 text-foreground/70" aria-hidden="true" />}
                                    </button>
                                );
                            })}
                        </div>
                        {errors.color && <p className="text-sm text-destructive">{errors.color}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-emerald-600 text-white hover:bg-emerald-700">
                            {processing && <Loader2 className="animate-spin" />}
                            Add action
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
