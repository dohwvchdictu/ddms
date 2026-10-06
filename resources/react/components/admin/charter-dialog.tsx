import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useEffect, type FormEvent } from 'react';
import Combobox from '@/components/combobox';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { store, update } from '@/routes/admin/citizen-charters';

export interface CharterValues {
    id?: number;
    name: string;
    office_id: string;
    required_days: number | null;
    is_external: boolean;
    is_active: boolean;
}

interface CharterDialogProps {
    /** The process to edit; values with no id add a new one; null closes. */
    charter: CharterValues | null;
    /** Active offices, for the owner. */
    offices: { id: string; name: string }[];
    onClose: () => void;
    /** Back on the list, reload just these props (it keeps its rows instead of showing its skeleton). */
    reloadOnly?: string[];
}

const Required = () => (
    <span className="text-destructive" aria-hidden="true">
        *
    </span>
);

/** Add or edit a Citizen's Charter process: its owner office, timeline and whether New Document offers it. */
export default function CharterDialog({ charter, offices, onClose, reloadOnly }: CharterDialogProps) {
    const form = useForm({ name: '', office_id: '', required_days: '', is_external: true, is_active: true });
    const { data, errors, processing } = form;
    const editing = charter?.id !== undefined;

    useEffect(() => {
        if (!charter) return;

        form.setData({
            name: charter.name,
            office_id: charter.office_id,
            required_days: charter.required_days === null ? '' : String(charter.required_days),
            is_external: charter.is_external,
            is_active: charter.is_active,
        });
        form.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [charter]);

    const submit = (event: FormEvent) => {
        event.preventDefault();

        form.submit(editing ? update(charter!.id!) : store(), {
            preserveScroll: true,
            ...(reloadOnly && { only: reloadOnly }),
            onSuccess: () => onClose(),
        });
    };

    return (
        <Dialog open={charter !== null} onOpenChange={(open) => !open && !processing && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <form onSubmit={submit} noValidate className="grid gap-5">
                    <DialogHeader>
                        <DialogTitle>{editing ? "Edit Citizen's Charter process" : "Add Citizen's Charter process"}</DialogTitle>
                        <DialogDescription>
                            {editing ? 'Changes apply to new documents; existing ones keep their process.' : 'New Document will offer it right away.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-2">
                        <Label htmlFor="charter-name">
                            Process name <Required />
                        </Label>
                        <Input
                            id="charter-name"
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
                        <Label htmlFor="charter-office">
                            Owner office <Required />
                        </Label>
                        <Combobox
                            id="charter-office"
                            options={offices.map((office) => ({ value: office.id, label: office.name }))}
                            value={data.office_id}
                            onChange={(office) => form.setData('office_id', office)}
                            placeholder="Choose an office…"
                            searchPlaceholder="Search office…"
                            invalid={!!errors.office_id}
                        />
                        {errors.office_id && <p className="text-sm text-destructive">{errors.office_id}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="charter-days">
                            Prescribed timeline (working days) <Required />
                        </Label>
                        <Input
                            id="charter-days"
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

                    <div className="grid gap-2 rounded-lg border p-3">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <Label htmlFor="charter-external">External</Label>
                                <p className="text-xs text-muted-foreground">A service for clients outside the office (an external request).</p>
                            </div>
                            <Switch id="charter-external" checked={data.is_external} onCheckedChange={(checked) => form.setData('is_external', checked)} />
                        </div>
                        <div className="flex items-center justify-between gap-4 border-t pt-2">
                            <div>
                                <Label htmlFor="charter-active">Active</Label>
                                <p className="text-xs text-muted-foreground">Inactive processes aren't offered on New Document.</p>
                            </div>
                            <Switch id="charter-active" checked={data.is_active} onCheckedChange={(checked) => form.setData('is_active', checked)} />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-emerald-600 text-white hover:bg-emerald-700">
                            {processing && <Loader2 className="animate-spin" />}
                            {editing ? 'Save' : 'Add process'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
