import { useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, ChevronDown, CircleCheckBig, KeyRound, Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import RemarkPresets from '@/components/pending/remark-presets';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getJson } from '@/lib/fetch-json';
import { cn } from '@/lib/utils';
import { close, closeCode } from '@/routes/pending';

interface CloseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** What is being closed: listed in step 1 so a wrong pick is caught before closing. */
    documents: { id: number; control_no: string; subject: string }[];
    /** Closing this many or more asks for the HRIS password instead of a code. */
    passwordThreshold: number;
    onDone: () => void;
}

/** How many documents the list shows before "and N more". */
const PREVIEW = 3;

const Required = () => (
    <span className="text-destructive" aria-hidden="true">
        *
    </span>
);

/**
 * End the selected documents' route here, in two steps: review what is
 * closing and why, then confirm. It can't be undone, so the confirmation is a
 * typed code for a few documents and the HRIS password for a batch.
 */
export default function CloseDialog({ open, onOpenChange, documents, passwordThreshold, onDone }: CloseDialogProps) {
    const form = useForm({ remarks: '', code: '', password: '' });
    const { data, errors, processing } = form;
    const count = documents.length;
    const usesPassword = count >= passwordThreshold;
    const label = count === 1 ? 'document' : `${count} documents`;

    const [step, setStep] = useState<'review' | 'confirm'>('review');
    const [showAll, setShowAll] = useState(false);
    const [code, setCode] = useState<string | null>(null);
    const [codeFailed, setCodeFailed] = useState(false);
    const secretField = useRef<HTMLInputElement>(null);
    const shown = showAll ? documents : documents.slice(0, PREVIEW);

    // A new code from the server each time; the server checks it.
    const loadCode = () => {
        setCode(null);
        setCodeFailed(false);
        getJson<{ code: string }>(closeCode.url())
            .then(({ code: fresh }) => setCode(fresh))
            .catch(() => setCodeFailed(true));
    };

    useEffect(() => {
        if (!open) return;

        form.reset();
        form.clearErrors();
        setStep('review');
        setShowAll(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useEffect(() => {
        if (step === 'confirm') {
            secretField.current?.focus();
        }
    }, [step]);

    const toConfirm = () => {
        if (data.remarks.trim() === '') {
            form.setError('remarks', 'Say how it was acted upon.');
            return;
        }

        form.clearErrors('remarks');
        form.setData((current) => ({ ...current, code: '', password: '' }));
        // Fetched on arrival, so the code shown is always fresh.
        if (!usesPassword) loadCode();
        setStep('confirm');
    };

    const ready = usesPassword ? data.password !== '' : code !== null && data.code.trim().length === code.length;

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (step === 'review') {
            toConfirm();
            return;
        }

        form.transform((current) => ({
            remarks: current.remarks,
            document_ids: documents.map((document) => document.id),
            ...(usesPassword ? { password: current.password } : { code: current.code.trim().toUpperCase() }),
        }));
        form.submit(close(), {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                onDone();
            },
            onError: (fieldErrors) => {
                // Remarks are fixed on the review step.
                if (fieldErrors.remarks) {
                    setStep('review');
                    return;
                }

                // A failed code is spent: show a new one. A failed password is cleared.
                if (usesPassword) {
                    form.setData('password', '');
                } else {
                    form.setData('code', '');
                    loadCode();
                }
                secretField.current?.focus();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={(next) => !processing && onOpenChange(next)}>
            <DialogContent className="gap-0 p-0 sm:max-w-lg">
                <form onSubmit={submit} noValidate>
                    <DialogHeader className="border-b px-6 pt-5 pb-4">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Step {step === 'review' ? 1 : 2} of 2</p>
                        <DialogTitle>{step === 'review' ? `Close ${label}?` : `Confirm closing ${label}`}</DialogTitle>
                        <DialogDescription>
                            {step === 'review'
                                ? "This ends their route here. It can't be undone."
                                : usesPassword
                                  ? 'Enter your HRIS password to close them.'
                                  : 'Type the code below to close it.'}
                        </DialogDescription>
                    </DialogHeader>

                    {step === 'review' ? (
                        <div className="grid gap-5 px-6 py-5">
                            {/* What is being closed, so a wrong pick is caught here. */}
                            <div className="overflow-hidden rounded-lg border">
                                <ul className={cn('divide-y', showAll && 'max-h-52 overflow-y-auto overscroll-contain')} aria-label="Documents to close">
                                    {shown.map((document) => (
                                        <li key={document.id} className="flex items-baseline gap-3 px-3 py-2 text-sm">
                                            <span className="shrink-0 font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">{document.control_no}</span>
                                            <span className="min-w-0 truncate text-muted-foreground" title={document.subject}>
                                                {document.subject}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                {count > PREVIEW && (
                                    <button
                                        type="button"
                                        onClick={() => setShowAll((value) => !value)}
                                        className="flex w-full items-center justify-center gap-1 border-t bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                                    >
                                        {showAll ? 'Show less' : `and ${count - PREVIEW} more`}
                                        <ChevronDown className={cn('size-3.5 transition-transform', showAll && 'rotate-180')} aria-hidden="true" />
                                    </button>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="close-remarks">
                                    Remarks <Required />
                                </Label>
                                <RemarkPresets value={data.remarks} onPick={(remark) => form.setData('remarks', remark)} />
                                <Textarea
                                    id="close-remarks"
                                    value={data.remarks}
                                    onChange={(event) => form.setData('remarks', event.target.value)}
                                    placeholder="How it was acted upon"
                                    rows={3}
                                    maxLength={1000}
                                    required
                                    aria-required="true"
                                    aria-invalid={!!errors.remarks || undefined}
                                    className="resize-none field-sizing-fixed"
                                />
                                {errors.remarks && <p className="text-sm text-destructive">{errors.remarks}</p>}
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-4 px-6 py-5 animate-in duration-200 fade-in slide-in-from-right-2">
                            {usesPassword ? (
                                <div className="grid gap-2">
                                    <Label htmlFor="close-password">
                                        HRIS password <Required />
                                    </Label>
                                    <div className="relative">
                                        <KeyRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                                        <Input
                                            ref={secretField}
                                            id="close-password"
                                            type="password"
                                            value={data.password}
                                            onChange={(event) => form.setData('password', event.target.value)}
                                            autoComplete="current-password"
                                            required
                                            aria-required="true"
                                            aria-invalid={!!errors.password || undefined}
                                            className="h-10 pl-9"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Closing {passwordThreshold} or more documents at once needs your password.</p>
                                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                                </div>
                            ) : (
                                <div className="grid gap-2">
                                    <Label htmlFor="close-code">
                                        Type the code to confirm <Required />
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="flex h-10 min-w-36 items-center justify-center rounded-md border border-dashed bg-muted/50 px-3 font-mono text-lg font-semibold tracking-[0.3em] select-none"
                                            aria-live="polite"
                                        >
                                            {code ?? (codeFailed ? '—' : <Loader2 className="size-4 animate-spin text-muted-foreground" />)}
                                        </span>
                                        <Button type="button" variant="ghost" size="icon" onClick={loadCode} aria-label="Show a new code" title="Show a new code">
                                            <RefreshCw />
                                        </Button>
                                    </div>
                                    <Input
                                        ref={secretField}
                                        id="close-code"
                                        value={data.code}
                                        onChange={(event) => form.setData('code', event.target.value.toUpperCase())}
                                        maxLength={code?.length ?? 8}
                                        autoComplete="off"
                                        spellCheck={false}
                                        required
                                        aria-required="true"
                                        aria-invalid={!!errors.code || undefined}
                                        className="h-10 font-mono tracking-[0.3em] uppercase"
                                    />
                                    {codeFailed && <p className="text-sm text-destructive">Couldn't get a code. Click ↻ to try again.</p>}
                                    {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="border-t bg-muted/30 px-6 py-4 sm:items-center">
                        {step === 'review' ? (
                            <>
                                <p className="mr-auto hidden text-xs text-muted-foreground sm:block">
                                    <span className="text-destructive">*</span> Required
                                </p>
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={data.remarks.trim() === ''}>
                                    Continue
                                    <ArrowRight />
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button type="button" variant="ghost" onClick={() => setStep('review')} disabled={processing} className="mr-auto">
                                    <ArrowLeft />
                                    Back
                                </Button>
                                <Button type="submit" variant="destructive" disabled={processing || !ready}>
                                    {processing ? <Loader2 className="animate-spin" /> : <CircleCheckBig />}
                                    Close {label}
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
