import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CalendarClock, ChevronRight, Loader2, Save } from 'lucide-react';
import { useEffect, useMemo, useRef, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { toast } from 'sonner';
import { store } from '@/actions/App/Http/Controllers/DocumentController';
import Combobox from '@/components/combobox';
import FormField, { describedBy } from '@/components/form/form-field';
import FormSection from '@/components/form/form-section';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { addWorkingDays, longDate, parseDay, requiredDays } from '@/lib/working-days';
import { dashboard } from '@/routes';

interface Option {
    id: number;
    name: string;
    required_days: number | null;
}

interface Props {
    controlNo: string;
    today: string;
    defaultRequiredDays: number;
    categories: Option[];
    charters: Option[];
    recentCategoryIds: number[];
}

const SUBJECT_MIN = 8;
const SUBJECT_MAX = 500;
/** When the counter starts warning that the subject is nearly full. */
const SUBJECT_WARN = 450;

/** What the subject has to spell out, by the kind of document. */
function subjectGuidance(categoryName: string | undefined): string {
    if (categoryName?.includes('Payment')) {
        return 'Include: 1) Payee, 2) Particulars with date and venue, 3) P.O. number (if available), 4) Total amount.';
    }

    if (categoryName?.includes('Purchase')) {
        return 'Include: 1) Description / particulars, 2) Total amount.';
    }

    if (categoryName) {
        return 'Type the document subject and other details (who, when and where).';
    }

    return 'Type your document subject and details.';
}

const toOptions = (items: Option[]) => items.map((item) => ({ value: String(item.id), label: item.name }));

export default function CreateDocumentPage(props: Props) {
    return (
        <AppLayout>
            <Head title="New Document" />

            <nav aria-label="Breadcrumb">
                <ol className="flex items-center gap-2 text-sm whitespace-nowrap text-muted-foreground">
                    <li>
                        <Link href={dashboard()} className="hover:text-foreground">
                            Dashboard
                        </Link>
                    </li>
                    <ChevronRight className="size-4" aria-hidden="true" />
                    <li className="truncate font-semibold text-foreground" aria-current="page">
                        New Document
                    </li>
                </ol>
            </nav>

            <h1 className="text-2xl font-semibold tracking-tight">New Document</h1>

            <DocumentForm {...props} />
        </AppLayout>
    );
}

type After = 'view' | 'new';

function blankForm(controlNo: string) {
    return {
        control_no: controlNo,
        source: '',
        is_arta: false,
        category_id: '',
        citizen_charter_id: '',
        subject: '',
        is_bundle: false,
    };
}

/** Each field's control, in page order, for focusing the first error. */
const FIELD_CONTROLS: Record<string, string> = {
    control_no: 'control_no',
    source: 'source-internal',
    is_arta: 'is_arta',
    citizen_charter_id: 'citizen_charter_id',
    category_id: 'category_id',
    subject: 'subject',
    is_bundle: 'is_bundle',
};

function focusFirstError(fields: string[]) {
    const first = Object.keys(FIELD_CONTROLS).find((field) => fields.includes(field));
    const control = first && document.getElementById(FIELD_CONTROLS[first]);

    if (control) {
        control.scrollIntoView({ behavior: 'smooth', block: 'center' });
        control.focus({ preventScroll: true });
    }
}

function DocumentForm({ controlNo, today, defaultRequiredDays, categories, charters, recentCategoryIds }: Props) {
    const { auth } = usePage().props;
    const after = useRef<After>('view');

    const form = useForm(blankForm(controlNo));

    const { data, errors, processing } = form;

    useUnsavedChanges(form.isDirty && !processing);

    // The server issues a new number after a save, or when the shown one was
    // used up elsewhere (another tab); take it without touching anything typed.
    useEffect(() => {
        form.setDefaults('control_no', controlNo);
        form.setData('control_no', controlNo);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [controlNo]);

    const category = categories.find((item) => String(item.id) === data.category_id);
    const charter = charters.find((item) => String(item.id) === data.citizen_charter_id);
    const categoryOptions = useMemo(() => toOptions(categories), [categories]);
    const charterOptions = useMemo(() => toOptions(charters), [charters]);
    const recent = useMemo(() => ({ heading: 'Recently used', values: recentCategoryIds.map(String) }), [recentCategoryIds]);

    // A charter transaction is classified by its charter procedure and a
    // regular one by its category, so switching drops whichever no longer shows.
    const setCharter = (isArta: boolean) => {
        form.setData((current) => ({ ...current, is_arta: isArta, category_id: '', citizen_charter_id: '' }));
        form.clearErrors('category_id', 'citizen_charter_id');
    };

    const save = (next: After) => {
        if (processing) {
            return;
        }

        after.current = next;
        form.transform((current) => ({ ...current, after: after.current === 'new' ? 'new' : null }));
        form.submit(store(), {
            // Keep the scroll position only when it comes back with errors.
            preserveScroll: 'errors',
            onSuccess: (page) => {
                // "Save & new" lands back on this page with its state kept, so
                // clear the form for the next document ourselves.
                if (after.current === 'new') {
                    const fresh = blankForm(page.props.controlNo as string);
                    form.setDefaults(fresh);
                    form.setData(fresh);
                }
            },
            onError: (fieldErrors) => {
                const count = Object.keys(fieldErrors).length;
                toast.error(count === 1 ? 'Please fix the highlighted field.' : `Please fix the ${count} highlighted fields.`);
                focusFirstError(Object.keys(fieldErrors));
            },
        });
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        save('view');
    };

    // Ctrl/⌘ + Enter saves from any field, the textarea included.
    const onKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            save('view');
        }
    };

    const classified = data.is_arta ? charter : category;
    const days = requiredDays(charter?.required_days, category?.required_days, defaultRequiredDays);
    const dueDate = addWorkingDays(parseDay(today), days);
    const subjectLength = data.subject.length;

    return (
        <form onSubmit={submit} onKeyDown={onKeyDown} noValidate className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="grid min-w-0 gap-6">
                <FormSection title="Classification">
                    <FormField label="Source" htmlFor="source-internal" required error={errors.source}>
                        <RadioGroup
                            value={data.source}
                            onValueChange={(value) => form.setData('source', value)}
                            aria-label="Document source"
                            aria-invalid={!!errors.source || undefined}
                            aria-describedby={describedBy('source-internal', { error: errors.source })}
                            className="flex gap-6 pt-2"
                        >
                            <RadioOption id="source-internal" value="internal" label="Internal" />
                            <RadioOption id="source-external" value="external" label="External" />
                        </RadioGroup>
                    </FormField>

                    <FormField label="Citizen's Charter" htmlFor="is_arta" error={errors.is_arta}>
                        <label htmlFor="is_arta" className="flex cursor-pointer items-start gap-3 pt-2">
                            <Switch
                                id="is_arta"
                                checked={data.is_arta}
                                onCheckedChange={setCharter}
                                className="data-[state=checked]:bg-emerald-600"
                            />
                            <span className="grid gap-0.5">
                                <span className="text-sm leading-none font-medium">Citizen's Charter transaction</span>
                                <span className="text-sm text-muted-foreground">Classified by its charter procedure instead of a category.</span>
                            </span>
                        </label>
                    </FormField>

                    {/* Keyed so the swap animates in. */}
                    <div key={data.is_arta ? 'charter' : 'category'} className="animate-in duration-200 fade-in slide-in-from-top-1">
                        {data.is_arta ? (
                            <FormField label="Charter procedure" htmlFor="citizen_charter_id" required error={errors.citizen_charter_id}>
                                <Combobox
                                    id="citizen_charter_id"
                                    options={charterOptions}
                                    value={data.citizen_charter_id}
                                    onChange={(value) => form.setData('citizen_charter_id', value)}
                                    placeholder="Select charter procedure"
                                    searchPlaceholder="Search procedures…"
                                    emptyText="No procedure matches."
                                    invalid={!!errors.citizen_charter_id}
                                    aria-describedby={describedBy('citizen_charter_id', { error: errors.citizen_charter_id })}
                                />
                            </FormField>
                        ) : (
                            <FormField label="Category" htmlFor="category_id" required error={errors.category_id}>
                                <Combobox
                                    id="category_id"
                                    options={categoryOptions}
                                    value={data.category_id}
                                    onChange={(value) => form.setData('category_id', value)}
                                    placeholder="Select category"
                                    searchPlaceholder="Search categories…"
                                    emptyText="No category matches."
                                    pinned={recent}
                                    allHeading="All categories"
                                    invalid={!!errors.category_id}
                                    aria-describedby={describedBy('category_id', { error: errors.category_id })}
                                />
                            </FormField>
                        )}
                    </div>
                </FormSection>

                <FormSection title="Details">
                    <FormField label="Subject" htmlFor="subject" required error={errors.subject} hint={subjectGuidance(category?.name)}>
                        <Textarea
                            id="subject"
                            value={data.subject}
                            onChange={(event) => form.setData('subject', event.target.value)}
                            placeholder={`At least ${SUBJECT_MIN} characters`}
                            maxLength={SUBJECT_MAX}
                            rows={5}
                            aria-invalid={!!errors.subject || undefined}
                            aria-describedby={describedBy('subject', { hint: true, error: errors.subject }, 'subject-count')}
                            className="min-h-32"
                        />
                        <SubjectCounter length={subjectLength} />
                    </FormField>

                    <FormField label="Bundle" htmlFor="is_bundle">
                        <label htmlFor="is_bundle" className="flex cursor-pointer items-start gap-3 pt-2">
                            <Switch
                                id="is_bundle"
                                checked={data.is_bundle}
                                onCheckedChange={(checked) => form.setData('is_bundle', checked)}
                                className="data-[state=checked]:bg-emerald-600"
                            />
                            <span className="grid gap-0.5">
                                <span className="text-sm leading-none font-medium">This is a bundle</span>
                                <span className="text-sm text-muted-foreground">Several documents routed together under one control number.</span>
                            </span>
                        </label>
                    </FormField>
                </FormSection>

                {/* Pinned to the bottom of the screen on phones, so Save is always in reach. */}
                <div className="sticky bottom-0 z-10 -mx-4 flex flex-col-reverse gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:flex-row sm:items-center sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
                    <p className="hidden text-xs text-muted-foreground sm:mr-auto sm:block">
                        <Kbd>Ctrl</Kbd> + <Kbd>Enter</Kbd> to save
                    </p>
                    <Button variant="ghost" asChild>
                        <Link href={dashboard()}>Cancel</Link>
                    </Button>
                    <Button type="button" variant="outline" disabled={processing} onClick={() => save('new')}>
                        {processing && after.current === 'new' && <Loader2 className="animate-spin" />}
                        Save &amp; new
                    </Button>
                    <Button type="submit" disabled={processing} className="bg-emerald-600 text-white hover:bg-emerald-700">
                        {processing && after.current === 'view' ? <Loader2 className="animate-spin" /> : <Save />}
                        {processing && after.current === 'view' ? 'Saving…' : 'Save'}
                    </Button>
                </div>
            </div>

            {/* Live summary: what will be saved, and the deadline it will get. */}
            {/* On phones only the control no. and deadline show, above the form. */}
            <aside aria-label="Summary" className="order-first lg:sticky lg:top-24 lg:order-0">
                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="border-b bg-emerald-700 px-4 py-4 text-white dark:bg-emerald-900">
                        <p className="text-xs font-medium tracking-wide text-emerald-100 uppercase">Control no.</p>
                        <p id="control_no" className="mt-1 truncate font-mono text-lg font-semibold">
                            {data.control_no}
                        </p>
                        {errors.control_no && (
                            <p className="mt-2 rounded-md bg-white/15 px-2 py-1.5 text-sm" role="alert">
                                {errors.control_no}
                            </p>
                        )}
                    </div>

                    <dl className="hidden divide-y text-sm lg:block">
                        <SummaryRow term="Type">{data.is_bundle ? 'Bundle' : 'Document'}</SummaryRow>
                        <SummaryRow term="Source">
                            {data.source ? <span className="capitalize">{data.source}</span> : <Placeholder>Not selected</Placeholder>}
                        </SummaryRow>
                        <SummaryRow term={data.is_arta ? 'Procedure' : 'Category'}>
                            {classified ? classified.name : <Placeholder>Not selected</Placeholder>}
                        </SummaryRow>
                        <SummaryRow term="Encoded by">
                            <span className="block">{auth.user?.name}</span>
                            {auth.user?.office?.name && <span className="block text-muted-foreground">{auth.user.office.name}</span>}
                        </SummaryRow>
                    </dl>

                    <div className="flex gap-3 border-t bg-muted/30 px-4 py-4">
                        <CalendarClock className="mt-0.5 size-5 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                        <div className="text-sm" aria-live="polite">
                            <p className="font-medium">Due {longDate.format(dueDate)}</p>
                            <p className="text-muted-foreground">
                                {days} working {days === 1 ? 'day' : 'days'}
                                {classified ? ` set by the ${data.is_arta ? 'procedure' : 'category'}` : ' (default until classified)'}
                            </p>
                        </div>
                    </div>
                </div>
            </aside>
        </form>
    );
}

function RadioOption({ id, value, label }: { id: string; value: string; label: string }) {
    return (
        <label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-sm">
            <RadioGroupItem id={id} value={value} />
            {label}
        </label>
    );
}

function SubjectCounter({ length }: { length: number }) {
    const left = SUBJECT_MAX - length;
    const short = length > 0 && length < SUBJECT_MIN;

    return (
        <p id="subject-count" className="mt-1.5 flex justify-between gap-2 text-xs text-muted-foreground tabular-nums" aria-live="polite">
            <span>{short && `${SUBJECT_MIN - length} more ${SUBJECT_MIN - length === 1 ? 'character' : 'characters'} needed`}</span>
            <span className={cn(length >= SUBJECT_WARN && 'font-medium text-amber-700 dark:text-amber-400')}>
                {length >= SUBJECT_WARN ? `${left} ${left === 1 ? 'character' : 'characters'} left` : `${length}/${SUBJECT_MAX}`}
            </span>
        </p>
    );
}

function SummaryRow({ term, children }: { term: string; children: ReactNode }) {
    return (
        <div className="grid grid-cols-[6.5rem_1fr] gap-3 px-4 py-3">
            <dt className="text-muted-foreground">{term}</dt>
            <dd className="min-w-0 wrap-break-word">{children}</dd>
        </div>
    );
}

function Placeholder({ children }: { children: ReactNode }) {
    return <span className="text-muted-foreground italic">{children}</span>;
}

function Kbd({ children }: { children: ReactNode }) {
    return <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[0.7rem]">{children}</kbd>;
}
