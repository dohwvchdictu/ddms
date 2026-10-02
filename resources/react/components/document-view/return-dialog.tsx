import { useForm, usePage } from '@inertiajs/react';
import { Loader2, Undo2 } from 'lucide-react';
import { useEffect, useMemo, type FormEvent } from 'react';
import { returnDocument } from '@/actions/App/Http/Controllers/DocumentViewController';
import Combobox from '@/components/combobox';
import type { Office } from '@/components/my-documents/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ReturnDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    documentId: number;
    controlNo: string;
    offices: Office[];
    /** The office that sent it here, picked by default. */
    sender: number | null;
}

/** Send a waiting document back to an office, with the reason. */
export default function ReturnDialog({ open, onOpenChange, documentId, controlNo, offices, sender }: ReturnDialogProps) {
    const { auth } = usePage().props;
    const form = useForm({ office_id: '', remarks: '' });
    const { data, errors, processing } = form;

    useEffect(() => {
        if (open) {
            form.setData({ office_id: sender ? String(sender) : '', remarks: '' });
            form.clearErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // Any active office but this one.
    const options = useMemo(
        () =>
            offices
                .filter((office) => String(office.id) !== String(auth.user?.office?.id))
                .map((office) => ({ value: String(office.id), label: office.code ? `${office.name} (${office.code})` : office.name })),
        [offices, auth.user?.office?.id],
    );

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.submit(returnDocument(documentId));
    };

    return (
        <Dialog open={open} onOpenChange={(next) => !processing && onOpenChange(next)}>
            <DialogContent className="gap-0 p-0 sm:max-w-lg">
                <form onSubmit={submit} noValidate>
                    <DialogHeader className="border-b px-6 pt-5 pb-4">
                        <DialogTitle>Return</DialogTitle>
                        <DialogDescription>{controlNo}</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-5 px-6 py-5">
                        <div className="grid gap-2">
                            <Label htmlFor="return-office">Return to</Label>
                            <Combobox
                                id="return-office"
                                options={options}
                                value={data.office_id}
                                onChange={(value) => form.setData('office_id', value)}
                                placeholder="Select office"
                                searchPlaceholder="Search offices…"
                                invalid={!!errors.office_id}
                            />
                            {errors.office_id && <p className="text-sm text-destructive">{errors.office_id}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="return-remarks">Reason</Label>
                            <Textarea
                                id="return-remarks"
                                value={data.remarks}
                                onChange={(event) => form.setData('remarks', event.target.value)}
                                placeholder="What needs to be fixed or completed"
                                rows={3}
                                maxLength={1000}
                                aria-invalid={!!errors.remarks || undefined}
                                className="resize-none field-sizing-fixed"
                            />
                            {errors.remarks && <p className="text-sm text-destructive">{errors.remarks}</p>}
                        </div>
                    </div>

                    <DialogFooter className="border-t bg-muted/30 px-6 py-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="destructive" disabled={processing}>
                            {processing ? <Loader2 className="animate-spin" /> : <Undo2 />}
                            Return
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
