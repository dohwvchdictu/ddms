import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { store, update } from '@/routes/admin/categories';

export interface CategoryValues {
    id?: number;
    name: string;
    required_days: number | null;
    is_active: boolean;
}

interface CategoryDialogProps {
    /** The category to edit; `{}`-like values with no id add a new one; null closes. */
    category: CategoryValues | null;
    onClose: () => void;
}

const Required = () => (
    <span className="text-destructive" aria-hidden="true">
        *
    </span>
);

/** Add or edit a category: its name, prescribed timeline and whether New Document offers it. */
export default function CategoryDialog({ category, onClose }: CategoryDialogProps) {
    const form = useForm({ name: '', required_days: '', is_active: true });
    const { data, errors, processing } = form;
    const editing = category?.id !== undefined;

    useEffect(() => {
        if (!category) return;

        form.setData({ name: category.name, required_days: category.required_days === null ? '' : String(category.required_days), is_active: category.is_active });
        form.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category]);

    const submit = (event: FormEvent) => {
        event.preventDefault();

        form.submit(editing ? update(category!.id!) : store(), {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <Dialog open={category !== null} onOpenChange={(open) => !open && !processing && onClose()}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={submit} noValidate className="grid gap-5">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit category' : 'Add category'}</DialogTitle>
                        <DialogDescription>{editing ? 'Changes apply to new documents; existing ones keep their category.' : 'New Document will offer it right away.'}</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-2">
                        <Label htmlFor="category-name">
                            Name <Required />
                        </Label>
                        <Input
                            id="category-name"
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
                        <Label htmlFor="category-days">
                            Prescribed timeline (working days) <Required />
                        </Label>
                        <Input
                            id="category-days"
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={365}
                            value={data.required_days}
                            onChange={(event) => form.setData('required_days', event.target.value)}
                            required
                            aria-invalid={!!errors.required_days || undefined}
                            className="w-32"
                        />
                        <p className="text-xs text-muted-foreground">Used for deadlines and the Overdue counts.</p>
                        {errors.required_days && <p className="text-sm text-destructive">{errors.required_days}</p>}
                    </div>

                    <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
                        <div>
                            <Label htmlFor="category-active">Active</Label>
                            <p className="text-xs text-muted-foreground">Inactive categories aren't offered on New Document.</p>
                        </div>
                        <Switch id="category-active" checked={data.is_active} onCheckedChange={(checked) => form.setData('is_active', checked)} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-emerald-600 text-white hover:bg-emerald-700">
                            {processing && <Loader2 className="animate-spin" />}
                            {editing ? 'Save' : 'Add category'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
