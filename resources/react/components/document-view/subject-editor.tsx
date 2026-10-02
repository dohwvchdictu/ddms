import { useForm } from '@inertiajs/react';
import { Check, Loader2, Pencil } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { updateSubject } from '@/actions/App/Http/Controllers/DocumentViewController';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface SubjectEditorProps {
    documentId: number;
    subject: string;
    editable: boolean;
    max: number;
}

const MIN = 8;

/** The subject, read as text; editable in place when the office may change it. */
export default function SubjectEditor({ documentId, subject, editable, max }: SubjectEditorProps) {
    const [editing, setEditing] = useState(false);
    const form = useForm({ subject });
    const field = useRef<HTMLTextAreaElement>(null);

    // A save reloads the page props: start the next edit from what was saved.
    useEffect(() => {
        if (!editing) {
            form.setDefaults({ subject });
            form.setData({ subject });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subject, editing]);

    useEffect(() => {
        if (editing) {
            const element = field.current;
            element?.focus();
            element?.setSelectionRange(element.value.length, element.value.length);
        }
    }, [editing]);

    const cancel = () => {
        form.reset();
        form.clearErrors();
        setEditing(false);
    };

    const save = () => {
        if (form.data.subject.trim() === subject.trim()) {
            cancel();
            return;
        }

        form.submit(updateSubject(documentId), { preserveScroll: true, onSuccess: () => setEditing(false) });
    };

    const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            cancel();
        } else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            save();
        }
    };

    if (!editing) {
        return (
            <div className="flex items-start gap-3">
                <p className="min-w-0 flex-1 text-sm leading-relaxed whitespace-pre-line">{subject}</p>
                {editable && (
                    <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="-mt-1 -mr-2 shrink-0 text-muted-foreground">
                        <Pencil />
                        Edit
                    </Button>
                )}
            </div>
        );
    }

    const length = form.data.subject.length;

    return (
        <div className="space-y-2">
            <Textarea
                ref={field}
                value={form.data.subject}
                onChange={(event) => form.setData('subject', event.target.value)}
                onKeyDown={onKeyDown}
                maxLength={max}
                rows={4}
                aria-label="Subject"
                aria-invalid={!!form.errors.subject || undefined}
                className="min-h-28 field-sizing-fixed"
            />
            <div className="flex flex-wrap items-center gap-2">
                <p className={cn('text-xs text-muted-foreground tabular-nums', length < MIN && 'text-amber-700 dark:text-amber-400')}>
                    {length < MIN ? `${MIN - length} more characters needed` : `${length}/${max}`}
                    <span className="hidden sm:inline"> · Ctrl + Enter to save, Esc to cancel</span>
                </p>
                <div className="ml-auto flex gap-2">
                    <Button variant="ghost" size="sm" onClick={cancel} disabled={form.processing}>
                        Cancel
                    </Button>
                    <Button size="sm" onClick={save} disabled={form.processing || length < MIN} className="bg-emerald-600 text-white hover:bg-emerald-700">
                        {form.processing ? <Loader2 className="animate-spin" /> : <Check />}
                        Save
                    </Button>
                </div>
            </div>
            {form.errors.subject && (
                <p className="text-sm text-destructive" role="alert">
                    {form.errors.subject}
                </p>
            )}
        </div>
    );
}
