import { useForm, usePage } from '@inertiajs/react';
import { Loader2, UserRoundCheck } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Combobox from '@/components/combobox';
import RemarkPresets from '@/components/pending/remark-presets';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getJson } from '@/lib/fetch-json';
import { employees as employeesRoute } from '@/routes/offices';
import { endorse } from '@/routes/pending';

interface EndorseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    documentIds: number[];
    onDone: () => void;
}

/** Hand the selected documents to someone in this office, with a note. */
export default function EndorseDialog({ open, onOpenChange, documentIds, onDone }: EndorseDialogProps) {
    const { auth } = usePage().props;
    const officeId = auth.user?.office?.id;
    const form = useForm({ endorsed_to: '', remarks: '' });
    const { data, errors, processing } = form;
    const [people, setPeople] = useState<{ id: number; name: string }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) return;

        form.reset();
        form.clearErrors();

        if (officeId) {
            setLoading(true);
            getJson<{ id: number; name: string }[]>(employeesRoute.url(Number(officeId)))
                .then(setPeople)
                .catch(() => setPeople([]))
                .finally(() => setLoading(false));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const options = useMemo(() => people.map((person) => ({ value: String(person.id), label: person.name })), [people]);
    const count = documentIds.length;

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.transform((current) => ({ ...current, document_ids: documentIds }));
        form.submit(endorse(), {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                onDone();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={(next) => !processing && onOpenChange(next)}>
            <DialogContent className="gap-0 p-0 sm:max-w-lg">
                <form onSubmit={submit} noValidate>
                    <DialogHeader className="border-b px-6 pt-5 pb-4">
                        <DialogTitle>Endorse</DialogTitle>
                        <DialogDescription>{count === 1 ? '1 document' : `${count} documents`} · to someone in your office</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-5 px-6 py-5">
                        <div className="grid gap-2">
                            <Label htmlFor="endorse-to">
                                Endorse to <span className="text-destructive" aria-hidden="true">*</span>
                            </Label>
                            <Combobox
                                id="endorse-to"
                                options={options}
                                value={data.endorsed_to}
                                onChange={(value) => form.setData('endorsed_to', value)}
                                placeholder={loading ? 'Loading…' : 'Select a person'}
                                searchPlaceholder="Search people…"
                                emptyText="No one matches."
                                disabled={loading}
                                invalid={!!errors.endorsed_to}
                            />
                            {errors.endorsed_to && <p className="text-sm text-destructive">{errors.endorsed_to}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="endorse-remarks">
                                Note <span className="text-destructive" aria-hidden="true">*</span>
                            </Label>
                            <RemarkPresets value={data.remarks} onPick={(remark) => form.setData('remarks', remark)} />
                            <Textarea
                                id="endorse-remarks"
                                required
                                aria-required="true"
                                value={data.remarks}
                                onChange={(event) => form.setData('remarks', event.target.value)}
                                placeholder="What they should do with it"
                                rows={3}
                                maxLength={1000}
                                aria-invalid={!!errors.remarks || undefined}
                                className="resize-none field-sizing-fixed"
                            />
                            {errors.remarks && <p className="text-sm text-destructive">{errors.remarks}</p>}
                        </div>
                    </div>

                    <DialogFooter className="border-t bg-muted/30 px-6 py-4 sm:items-center">
                        <p className="mr-auto hidden text-xs text-muted-foreground sm:block">
                            <span className="text-destructive">*</span> Required
                        </p>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-emerald-600 text-white hover:bg-emerald-700">
                            {processing ? <Loader2 className="animate-spin" /> : <UserRoundCheck />}
                            Endorse
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
