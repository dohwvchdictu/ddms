import { useForm } from '@inertiajs/react';
import { Loader2, Send } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import Combobox from '@/components/combobox';
import { describedBy } from '@/components/form/form-field';
import type { DocumentRow, Office } from '@/components/my-documents/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getJson } from '@/lib/fetch-json';
import { employees as employeesRoute } from '@/routes/offices';
import { forward } from '@/routes/my-documents';

interface ForwardDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Only the id and control number are used, so any document list fits. */
    documents: Pick<DocumentRow, 'id' | 'control_no'>[];
    offices: Office[];
    /** Called once the server has forwarded them; the list reloads by itself. */
    onForwarded: () => void;
    /** Where to send it; My Documents' forward by default. Pending passes its own. */
    action?: { url: string; method: 'post' };
}

interface Employee {
    id: number;
    name: string;
}

const REMARKS_MAX = 1000;

/** The usual routing notes, one tap each. */
const SUGGESTED_REMARKS = ['For appropriate action', 'For signature', 'For approval', 'For review', 'For information'];

/** Offices this browser forwarded to lately, most recent first, offered at the top of the picker. */
const RECENT_KEY = 'forward:recent-offices';
const RECENT_MAX = 5;

function readRecent(): string[] {
    try {
        const stored = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');

        return Array.isArray(stored) ? stored.filter((id): id is string => typeof id === 'string').slice(0, RECENT_MAX) : [];
    } catch {
        return [];
    }
}

function rememberRecent(officeId: string): void {
    try {
        localStorage.setItem(RECENT_KEY, JSON.stringify([officeId, ...readRecent().filter((id) => id !== officeId)].slice(0, RECENT_MAX)));
    } catch {
        // Storage blocked: the picker just has no "Recent" group.
    }
}

/** Forward the selected documents to another office, optionally endorsed to someone there. */
export default function ForwardDialog({ open, onOpenChange, documents, offices, onForwarded, action }: ForwardDialogProps) {
    const form = useForm({ assigned_to: '', endorsed_to: '', remarks: '' });
    const { data, errors, processing } = form;
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const [recent, setRecent] = useState<string[]>([]);

    // Read fresh each time it opens, so a forward made a moment ago shows up.
    useEffect(() => {
        if (open) {
            setRecent(readRecent());
        }
    }, [open]);

    const officeOptions = useMemo(
        () =>
            offices.map((office) => ({
                value: String(office.id),
                label: office.code ? `${office.name} (${office.code})` : office.name,
            })),
        [offices],
    );
    const employeeOptions = useMemo(
        () =>
            employees.map((employee) => ({
                value: String(employee.id),
                label: employee.name,
            })),
        [employees],
    );
    const recentOffices = useMemo(() => ({ heading: 'Recent', values: recent }), [recent]);

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
        if (processing) {
            return;
        }

        onOpenChange(next);

        if (!next) {
            form.reset();
            form.clearErrors();
        }
    };

    const submit = (event?: FormEvent) => {
        event?.preventDefault();

        if (processing) {
            return;
        }

        form.transform((current) => ({
            ...current,
            endorsed_to: current.endorsed_to || null,
            remarks: current.remarks.trim() || null,
            document_ids: documents.map((document) => document.id),
        }));

        form.submit(action ?? forward(), {
            preserveScroll: true,
            onSuccess: () => {
                rememberRecent(data.assigned_to);
                form.reset();
                onForwarded();
                onOpenChange(false);
            },
        });
    };

    // Ctrl/⌘ + Enter sends from any field, the remarks box included.
    const onKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            submit();
        }
    };

    /** A suggested remark: fills an empty box, or is added after what is there. */
    const addRemark = (remark: string) => {
        const current = data.remarks.trim();
        form.setData('remarks', current ? `${current.replace(/[.;,]$/, '')}; ${remark}` : remark);
    };

    const count = documents.length;
    const idsError = (errors as Record<string, string | undefined>).document_ids;
    const destination = offices.find((office) => String(office.id) === data.assigned_to);

    return (
        <Dialog open={open} onOpenChange={close}>
            {/* Never taller than the screen: header and footer stay put, the middle scrolls. The
                column is pinned to the box's width (minmax(0,1fr)), so a long subject or office
                name truncates or wraps instead of stretching the dialog past its edge. */}
            <DialogContent className="max-h-[calc(100dvh-2rem)] grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)] gap-0 overflow-hidden p-0 sm:max-w-xl">
                <form onSubmit={submit} onKeyDown={onKeyDown} noValidate className="flex max-h-[calc(100dvh-2rem)] min-h-0 min-w-0 flex-col">
                    <div className="grid shrink-0 gap-1 border-b px-6 pt-5 pb-4">
                        <DialogTitle>Forward</DialogTitle>
                        <DialogDescription>
                            {count === 1 ? `${documents[0]?.control_no}` : `${count} documents`}
                        </DialogDescription>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                        <div className="grid gap-5 px-6 py-5">
                            {idsError && (
                                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
                                    {idsError}
                                </p>
                            )}

                            <Field label="Forward to" htmlFor="assigned_to" required error={errors.assigned_to}>
                                <Combobox
                                    id="assigned_to"
                                    options={officeOptions}
                                    value={data.assigned_to}
                                    onChange={(value) =>
                                        form.setData((current) => ({
                                            ...current,
                                            assigned_to: value,
                                            endorsed_to: '',
                                        }))
                                    }
                                    placeholder="Select office"
                                    searchPlaceholder="Search offices…"
                                    emptyText="No office matches."
                                    pinned={recentOffices}
                                    allHeading="All offices"
                                    invalid={!!errors.assigned_to}
                                    aria-describedby={describedBy('assigned_to', { error: errors.assigned_to })}
                                />
                            </Field>

                            <Field label="Endorsed to" htmlFor="endorsed_to" optional error={errors.endorsed_to}>
                                <Combobox
                                    id="endorsed_to"
                                    options={employeeOptions}
                                    value={data.endorsed_to}
                                    onChange={(value) => form.setData('endorsed_to', value === data.endorsed_to ? '' : value)}
                                    placeholder={
                                        !data.assigned_to
                                            ? 'Choose an office first'
                                            : loadingEmployees
                                              ? 'Loading people…'
                                              : employees.length === 0
                                                ? 'No one listed for this office'
                                                : `Anyone in ${destination?.code ?? 'the office'}`
                                    }
                                    searchPlaceholder="Search people…"
                                    emptyText="No one matches."
                                    disabled={!data.assigned_to || loadingEmployees || employees.length === 0}
                                    invalid={!!errors.endorsed_to}
                                    aria-describedby={describedBy('endorsed_to', { error: errors.endorsed_to })}
                                />
                            </Field>

                            <Field label="Remarks" htmlFor="remarks" optional error={errors.remarks}>
                                <div className="mb-2 flex flex-wrap gap-1.5" aria-label="Suggested remarks">
                                    {SUGGESTED_REMARKS.map((remark) => (
                                        <button
                                            key={remark}
                                            type="button"
                                            onClick={() => addRemark(remark)}
                                            className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300"
                                        >
                                            {remark}
                                        </button>
                                    ))}
                                </div>
                                <Textarea
                                    id="remarks"
                                    value={data.remarks}
                                    onChange={(event) => form.setData('remarks', event.target.value)}
                                    maxLength={REMARKS_MAX}
                                    rows={3}
                                    placeholder="Anything the receiving office should know"
                                    aria-invalid={!!errors.remarks || undefined}
                                    // Fixed size: the shared Textarea grows with its content, which here would widen the dialog.
                                className="resize-none field-sizing-fixed"
                                />
                            </Field>
                        </div>
                    </div>

                    <div className="flex shrink-0 flex-col-reverse gap-2 border-t bg-muted/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
                        <p className="hidden text-xs text-muted-foreground sm:mr-auto sm:block">
                            <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono text-[0.7rem]">Ctrl</kbd> +{' '}
                            <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono text-[0.7rem]">Enter</kbd> to send
                        </p>
                        <Button type="button" variant="outline" onClick={() => close(false)} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing || count === 0} className="bg-emerald-600 text-white hover:bg-emerald-700">
                            {processing ? <Loader2 className="animate-spin" /> : <Send />}
                            {processing ? 'Forwarding…' : 'Forward'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

/** A labelled field with its error underneath. */
function Field({
    label,
    htmlFor,
    required = false,
    optional = false,
    error,
    children,
}: {
    label: string;
    htmlFor: string;
    required?: boolean;
    optional?: boolean;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={htmlFor}>
                {label}
                {required && (
                    <span className="text-destructive" aria-hidden="true">
                        *
                    </span>
                )}
                {optional && <span className="font-normal text-muted-foreground">(optional)</span>}
            </Label>
            <div className="min-w-0">
                {children}
                {error && (
                    <p id={`${htmlFor}-error`} className="mt-1.5 text-sm text-destructive" role="alert">
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
}
