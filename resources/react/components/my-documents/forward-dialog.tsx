import { useForm } from '@inertiajs/react';
import { Loader2, Send } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Combobox from '@/components/combobox';
import { describedBy } from '@/components/form/form-field';
import type { DocumentRow, Office } from '@/components/my-documents/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getJson } from '@/lib/fetch-json';
import { employees as employeesRoute } from '@/routes/offices';
import { forward } from '@/routes/my-documents';

interface ForwardDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    documents: DocumentRow[];
    offices: Office[];
    /** Called once the server has forwarded them; the list reloads by itself. */
    onForwarded: () => void;
}

interface Employee {
    id: number;
    name: string;
}

const REMARKS_MAX = 1000;

/** Forward the selected documents to another office, optionally endorsed to someone there. */
export default function ForwardDialog({ open, onOpenChange, documents, offices, onForwarded }: ForwardDialogProps) {
    const form = useForm({ assigned_to: '', endorsed_to: '', remarks: '' });
    const { data, errors, processing } = form;
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);

    const officeOptions = useMemo(
        () => offices.map((office) => ({ value: String(office.id), label: office.code ? `${office.name} (${office.code})` : office.name })),
        [offices],
    );
    const employeeOptions = useMemo(() => employees.map((employee) => ({ value: String(employee.id), label: employee.name })), [employees]);

    // The people of the chosen office, for "endorsed to".
    useEffect(() => {
        setEmployees([]);

        if (!data.assigned_to) {
            return;
        }

        const controller = new AbortController();
        setLoadingEmployees(true);

        getJson<Employee[]>(employeesRoute.url(data.assigned_to), controller.signal)
            .then(setEmployees)
            .catch(() => {
                // Optional field: without the list the forward still works.
                if (!controller.signal.aborted) {
                    setEmployees([]);
                }
            })
            .finally(() => !controller.signal.aborted && setLoadingEmployees(false));

        return () => controller.abort();
    }, [data.assigned_to]);

    const close = (next: boolean) => {
        if (!processing) {
            onOpenChange(next);
        }

        if (!next && !processing) {
            form.reset();
            form.clearErrors();
        }
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        form.transform((current) => ({
            ...current,
            endorsed_to: current.endorsed_to || null,
            remarks: current.remarks.trim() || null,
            document_ids: documents.map((document) => document.id),
        }));

        form.submit(forward(), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onForwarded();
                onOpenChange(false);
            },
        });
    };

    const count = documents.length;
    const idsError = (errors as Record<string, string | undefined>).document_ids;

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="sm:max-w-lg">
                <form onSubmit={submit} noValidate className="grid gap-5">
                    <DialogHeader>
                        <DialogTitle>Forward {count === 1 ? 'document' : `${count} documents`}</DialogTitle>
                        <DialogDescription>
                            {count === 1 ? documents[0]?.control_no : 'They'} will wait at the office you choose until it is received. Bundle
                            attachments go with their bundle.
                        </DialogDescription>
                    </DialogHeader>

                    {idsError && (
                        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
                            {idsError}
                        </p>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="assigned_to">
                            Forward to
                            <span className="text-destructive" aria-hidden="true">
                                *
                            </span>
                        </Label>
                        <Combobox
                            id="assigned_to"
                            options={officeOptions}
                            value={data.assigned_to}
                            onChange={(value) => form.setData((current) => ({ ...current, assigned_to: value, endorsed_to: '' }))}
                            placeholder="Select office"
                            searchPlaceholder="Search offices…"
                            emptyText="No office matches."
                            invalid={!!errors.assigned_to}
                            aria-describedby={describedBy('assigned_to', { error: errors.assigned_to })}
                        />
                        {errors.assigned_to && (
                            <p id="assigned_to-error" className="text-sm text-destructive" role="alert">
                                {errors.assigned_to}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="endorsed_to">
                            Endorsed to <span className="font-normal text-muted-foreground">(optional)</span>
                        </Label>
                        <Combobox
                            id="endorsed_to"
                            options={employeeOptions}
                            value={data.endorsed_to}
                            onChange={(value) => form.setData('endorsed_to', value === data.endorsed_to ? '' : value)}
                            placeholder={!data.assigned_to ? 'Choose an office first' : loadingEmployees ? 'Loading people…' : 'Anyone in the office'}
                            searchPlaceholder="Search people…"
                            emptyText="No one matches."
                            disabled={!data.assigned_to || loadingEmployees || employees.length === 0}
                            invalid={!!errors.endorsed_to}
                            aria-describedby={describedBy('endorsed_to', { error: errors.endorsed_to })}
                        />
                        {errors.endorsed_to && (
                            <p id="endorsed_to-error" className="text-sm text-destructive" role="alert">
                                {errors.endorsed_to}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="remarks">
                            Remarks <span className="font-normal text-muted-foreground">(optional)</span>
                        </Label>
                        <Textarea
                            id="remarks"
                            value={data.remarks}
                            onChange={(event) => form.setData('remarks', event.target.value)}
                            maxLength={REMARKS_MAX}
                            rows={3}
                            placeholder="Anything the receiving office should know"
                            aria-invalid={!!errors.remarks || undefined}
                        />
                        {errors.remarks && (
                            <p className="text-sm text-destructive" role="alert">
                                {errors.remarks}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => close(false)} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing || count === 0} className="bg-emerald-600 text-white hover:bg-emerald-700">
                            {processing ? <Loader2 className="animate-spin" /> : <Send />}
                            {processing ? 'Forwarding…' : 'Forward'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
