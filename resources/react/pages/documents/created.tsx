import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CalendarClock, CircleCheck, FilePlus2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { create } from '@/actions/App/Http/Controllers/DocumentController';
import CopyButton from '@/components/copy-button';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { longDate, parseDay } from '@/lib/working-days';
import { dashboard } from '@/routes';

interface Props {
    document: {
        id: number;
        control_no: string;
        subject: string;
        classification: string;
        source: string;
        is_arta: boolean;
        is_bundle: boolean;
        created_at: string | null;
        required_days: number;
        due_date: string;
    };
    /** The My Documents list it was filed under. */
    listPath: string;
}

const dateTime = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

/** Shown after a save: the control number up front, and what to do next. */
export default function DocumentCreated({ document, listPath }: Props) {
    const kind = document.is_bundle ? 'Bundle' : 'Document';

    return (
        <AppLayout breadcrumbs={[{ title: 'Home', href: dashboard() }, { title: 'New Document', href: create() }, { title: 'Saved' }]}>
            <Head title={`${kind} saved`} />

            {/* One receipt-style card, short enough to fit on screen without scrolling. */}
            <section aria-labelledby="saved-heading" className="mx-auto w-full max-w-lg overflow-hidden rounded-xl border bg-card shadow-sm">
                <div className="flex flex-col items-center gap-3 px-6 pt-8 pb-6 text-center">
                    <span className="flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 animate-in zoom-in-50 duration-300 dark:bg-emerald-950 dark:text-emerald-400">
                        <CircleCheck className="size-7" />
                    </span>
                    <h1 id="saved-heading" className="text-xl font-semibold tracking-tight">
                        {kind} saved
                    </h1>
                    <div className="mt-1 flex w-full items-center justify-center gap-1 rounded-lg border bg-muted/40 py-2 pr-2 pl-4">
                        <span className="truncate font-mono text-lg font-semibold tracking-wide sm:text-xl">{document.control_no}</span>
                        <CopyButton value={document.control_no} label="Copy control no." />
                    </div>
                </div>

                {/* Dashed rule: the receipt's tear line between number and details. */}
                <dl className="grid gap-2.5 border-t border-dashed px-6 py-5 text-sm">
                    <Row term={document.is_arta ? 'Procedure' : 'Category'}>{document.classification}</Row>
                    <Row term="Source">
                        <span className="capitalize">{document.source}</span>
                        <span className="text-muted-foreground"> · {kind}</span>
                    </Row>
                    <Row term="Deadline">
                        <span className="inline-flex items-start gap-1.5">
                            <CalendarClock className="mt-0.5 size-4 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                            <span>
                                {longDate.format(parseDay(document.due_date))}
                                <span className="text-muted-foreground">
                                    {' '}
                                    · {document.required_days} working {document.required_days === 1 ? 'day' : 'days'}
                                </span>
                            </span>
                        </span>
                    </Row>
                    <Row term="Subject">
                        <span className="line-clamp-3" title={document.subject}>
                            {document.subject}
                        </span>
                    </Row>
                    {document.created_at && <Row term="Encoded">{dateTime.format(new Date(document.created_at))}</Row>}
                </dl>

                <p className="mx-6 mb-5 flex gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm dark:bg-emerald-950/30">
                    <ArrowRight className="mt-0.5 size-4 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                    <span>
                        <span className="font-medium">Next:</span> forward it from My Documents. Its transmittal form can be printed once forwarded.
                    </span>
                </p>

                <div className="flex flex-col gap-2 border-t bg-muted/30 px-6 py-4 sm:flex-row sm:justify-end">
                    <Button variant="outline" asChild>
                        <Link href={create()}>
                            <FilePlus2 />
                            Encode another
                        </Link>
                    </Button>
                    <Button asChild className="bg-emerald-600 text-white hover:bg-emerald-700">
                        <Link href={listPath}>
                            My Documents
                            <ArrowRight />
                        </Link>
                    </Button>
                </div>
            </section>
        </AppLayout>
    );
}

function Row({ term, children }: { term: string; children: ReactNode }) {
    return (
        <div className="grid grid-cols-[5.5rem_1fr] gap-3">
            <dt className="text-muted-foreground">{term}</dt>
            <dd className="min-w-0 wrap-break-word">{children}</dd>
        </div>
    );
}
