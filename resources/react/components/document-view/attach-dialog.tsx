import { useForm } from '@inertiajs/react';
import { Check, FileSearch, Loader2, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { attach } from '@/actions/App/Http/Controllers/DocumentViewController';
import SearchInput from '@/components/search-input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface Attachable {
    id: number;
    control_no: string;
    subject: string;
    classification: string;
    /** The office that encoded it. */
    origin: string | null;
    received_at: string | null;
}

const dateFormat = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

interface AttachDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bundleId: number;
    bundleControlNo: string;
    candidates: Attachable[];
}

/** Pick documents this office is working on and put them in the bundle. */
export default function AttachDialog({ open, onOpenChange, bundleId, bundleControlNo, candidates }: AttachDialogProps) {
    const form = useForm<{ document_ids: number[] }>({ document_ids: [] });
    const [query, setQuery] = useState('');

    useEffect(() => {
        if (open) {
            form.reset();
            form.clearErrors();
            setQuery('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const picked = new Set(form.data.document_ids);
    const term = query.trim().toLowerCase();
    const shown = useMemo(
        () =>
            term
                ? candidates.filter((item) => `${item.control_no} ${item.subject} ${item.classification} ${item.origin ?? ''}`.toLowerCase().includes(term))
                : candidates,
        [candidates, term],
    );

    const toggle = (id: number) =>
        form.setData('document_ids', picked.has(id) ? form.data.document_ids.filter((value) => value !== id) : [...form.data.document_ids, id]);

    const submit = () =>
        form.submit(attach(bundleId), {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        });

    const error = form.errors.document_ids ?? Object.entries(form.errors).find(([key]) => key.startsWith('document_ids.'))?.[1];

    return (
        <Dialog open={open} onOpenChange={(next) => !form.processing && onOpenChange(next)}>
            <DialogContent className="max-h-[calc(100dvh-2rem)] grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:max-w-3xl">
                <DialogHeader className="border-b px-6 pt-5 pb-4">
                    <DialogTitle>Add to bundle</DialogTitle>
                    <DialogDescription>{bundleControlNo}</DialogDescription>
                </DialogHeader>

                <div className="flex min-h-0 flex-col">
                    {candidates.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
                            <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                <FileSearch className="size-5" />
                            </div>
                            <p className="text-sm font-medium">Nothing to add</p>
                            <p className="text-sm text-muted-foreground">Only documents your office has received and is working on can go in a bundle.</p>
                        </div>
                    ) : (
                        <>
                            <div className="border-b p-3">
                                <SearchInput value={query} onChange={setQuery} placeholder="Search control no., subject or office…" label="Search documents to add" />
                            </div>
                            <ul className="min-h-0 flex-1 divide-y overflow-y-auto overscroll-contain" role="listbox" aria-multiselectable="true" aria-label="Documents">
                                {shown.map((item) => {
                                    const on = picked.has(item.id);

                                    return (
                                        <li key={item.id} role="option" aria-selected={on}>
                                            <button
                                                type="button"
                                                onClick={() => toggle(item.id)}
                                                className={cn('flex w-full items-start gap-3 px-4 py-3 text-left outline-none hover:bg-accent focus-visible:bg-accent', on && 'bg-emerald-50/70 dark:bg-emerald-950/30')}
                                            >
                                                <span
                                                    aria-hidden="true"
                                                    className={cn(
                                                        'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[4px] border',
                                                        on ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-input',
                                                    )}
                                                >
                                                    {on && <Check className="size-3" />}
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                                                        <span className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">{item.control_no}</span>
                                                        {item.received_at && (
                                                            <span className="text-xs text-muted-foreground">Received {dateFormat.format(new Date(item.received_at))}</span>
                                                        )}
                                                    </span>
                                                    <span className="block truncate text-xs font-medium text-muted-foreground">{item.classification}</span>
                                                    <span className="mt-1 line-clamp-2 block text-sm" title={item.subject}>
                                                        {item.subject}
                                                    </span>
                                                    {item.origin && <span className="mt-0.5 block truncate text-xs text-muted-foreground">From {item.origin}</span>}
                                                </span>
                                            </button>
                                        </li>
                                    );
                                })}
                                {shown.length === 0 && <li className="px-4 py-8 text-center text-sm text-muted-foreground">No document matches “{query}”.</li>}
                            </ul>
                        </>
                    )}
                    {error && (
                        <p className="border-t px-6 py-2 text-sm text-destructive" role="alert">
                            {error}
                        </p>
                    )}
                </div>

                <DialogFooter className="border-t bg-muted/30 px-6 py-4 sm:items-center">
                    <p className="mr-auto hidden text-sm text-muted-foreground sm:block">
                        {picked.size > 0 ? `${picked.size} selected` : 'Pick one or more'}
                    </p>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={form.processing}>
                        Cancel
                    </Button>
                    <Button onClick={submit} disabled={picked.size === 0 || form.processing} className="bg-emerald-600 text-white hover:bg-emerald-700">
                        {form.processing ? <Loader2 className="animate-spin" /> : <Plus />}
                        Add {picked.size > 0 ? picked.size : ''}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
