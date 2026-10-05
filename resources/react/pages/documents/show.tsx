import { Head, Link, router } from '@inertiajs/react';
import { CircleCheckBig, EllipsisVertical, ExternalLink, History, PackageCheck, PackagePlus, Printer, Send, Trash2, Undo2, UserRoundCheck, X, type LucideIcon } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { destroy, detach, show } from '@/actions/App/Http/Controllers/DocumentViewController';
import ConfirmDialog from '@/components/confirm-dialog';
import CopyButton from '@/components/copy-button';
import ListTabs from '@/components/data-table/list-tabs';
import DescriptionList, { type DescriptionItem } from '@/components/description-list';
import AttachDialog, { type Attachable } from '@/components/document-view/attach-dialog';
import ReturnDialog from '@/components/document-view/return-dialog';
import CloseDialog from '@/components/pending/close-dialog';
import EndorseDialog from '@/components/pending/endorse-dialog';
import SubjectEditor from '@/components/document-view/subject-editor';
import { type TimelineRow } from '@/components/document-timeline';
import { describeLocation } from '@/components/document-tracking';
import ForwardDialog from '@/components/my-documents/forward-dialog';
import type { Office } from '@/components/my-documents/types';
import StatusBadge from '@/components/status-badge';
import TrackingDialog from '@/components/tracking-dialog';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { printTransmittalForm } from '@/lib/print-page';
import { cn } from '@/lib/utils';
import { longDate, parseDay } from '@/lib/working-days';
import { dashboard, incoming, myDocuments, pending } from '@/routes';
import { forward as pendingForward } from '@/routes/pending';
import { receive } from '@/routes/incoming';

interface DocumentDetails {
    id: number;
    control_no: string;
    subject: string;
    classification: string;
    charter: string | null;
    status: string;
    source: string;
    is_bundle: boolean;
    /** The bundle this document travels in, if any. */
    bundle: string | null;
    created_at: string | null;
    origin: string | null;
    encoded_by: string | null;
    endorsed_to: string | null;
    current_location: string | null;
    turnaround: string | null;
    required_days: number;
    due_date: string;
    days_left: number | null;
}

interface Attachment {
    id: number;
    control_no: string;
    subject: string;
    classification: string;
    status: string;
    location: string | null;
    removable: boolean;
}

interface Props {
    document: DocumentDetails;
    timeline: TimelineRow[];
    attachments: Attachment[];
    attachable: Attachable[];
    can: {
        forward: boolean;
        delete: boolean;
        edit_subject: boolean;
        manage_attachments: boolean;
        print: boolean;
        receive: boolean;
        return: boolean;
        /** On process here: Forward, Endorse and Close, as on the Pending list. */
        pending: boolean;
    };
    offices: Office[];
    subjectMax: number;
    /** Which list it was opened from: decides the breadcrumb trail. */
    context: 'documents' | 'incoming' | 'pending';
    /** The office that sent it here; Return picks it by default. */
    sender: number | null;
    /** Closing this many documents or more asks for the HRIS password. */
    closePasswordThreshold: number;
}

/** The trail back to the list the document was opened from. */
const TRAILS = {
    documents: { title: 'My Documents', href: () => myDocuments() },
    incoming: { title: 'Incoming', href: () => incoming() },
    pending: { title: 'Pending', href: () => pending() },
};

const dateTime = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

export default function ShowDocument({ document, timeline, attachments, attachable, can, offices, subjectMax, context, sender, closePasswordThreshold }: Props) {
    const [forwarding, setForwarding] = useState(false);
    const [attaching, setAttaching] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [removing, setRemoving] = useState<Attachment | null>(null);
    const [busy, setBusy] = useState(false);
    const [tracking, setTracking] = useState(false);
    const [tab, setTab] = useState('bundle');
    const [confirmingReceive, setConfirmingReceive] = useState(false);
    const [returning, setReturning] = useState(false);
    const [endorsing, setEndorsing] = useState(false);
    const [closing, setClosing] = useState(false);

    // Receiving reloads this page: the document is now on process here.
    const receiveDocument = () =>
        router.post(
            receive.url(),
            { document_ids: [document.id] },
            {
                preserveScroll: true,
                onStart: () => setBusy(true),
                onFinish: () => {
                    setBusy(false);
                    setConfirmingReceive(false);
                },
            },
        );

    const kind = document.is_bundle ? 'bundle' : 'document';

    const remove = () => {
        if (!removing) return;

        router.visit(detach({ document: document.id, attachment: removing.id }), {
            preserveScroll: true,
            onStart: () => setBusy(true),
            onFinish: () => {
                setBusy(false);
                setRemoving(null);
            },
        });
    };

    const deleteDocument = () =>
        router.visit(destroy(document.id), {
            onStart: () => setBusy(true),
            onFinish: () => setBusy(false),
        });

    // Everything below is data: add a fact, a detail, an action or a tab by adding an entry.

    /** Secondary actions: icon buttons with a tooltip, beside the one main action. */
    const tools: { key: string; label: string; icon: LucideIcon; show: boolean; onClick?: () => void; href?: string }[] = [
        { key: 'history', label: 'Routing history', icon: History, show: true, onClick: () => setTracking(true) },
        { key: 'print', label: 'Print transmittal form', icon: Printer, show: can.print, onClick: () => printTransmittalForm(document.control_no) },
    ];

    /** Rarely used or destructive: kept in the ⋮ menu so they can't be hit by accident. */
    const menu: { key: string; label: string; icon: LucideIcon; show: boolean; onSelect: () => void; destructive?: boolean }[] = [
        { key: 'delete', label: `Delete ${kind}`, icon: Trash2, show: can.delete, onSelect: () => setDeleting(true), destructive: true },
    ];

    const location = describeLocation(document.status, document.current_location);

    const facts: DescriptionItem[] = [
        {
            term: location.label,
            value: document.status === 'For Receiving' && location.office ? (
                <>
                    {location.office}
                    <span className="block text-xs font-normal text-muted-foreground">Awaiting receipt</span>
                </>
            ) : (
                (location.office ?? '—')
            ),
        },
        { term: 'Origin', value: document.origin ?? '—' },
        { term: 'Encoded by', value: document.encoded_by ?? '—' },
        { term: 'Created', value: document.created_at ? dateTime.format(new Date(document.created_at)) : '—' },
        { term: 'Source', value: <span className="capitalize">{document.source}</span> },
        { term: 'Type', value: document.is_bundle ? 'Bundle' : 'Document' },
        { term: 'Turnaround', value: document.turnaround, show: !!document.turnaround },
        { term: 'Charter', value: document.charter, show: !!document.charter },
        { term: 'Endorsed to', value: document.endorsed_to, show: !!document.endorsed_to },
    ];

    const remarks = timeline.filter((row) => row.remarks);

    // Shown below the summary only when there is something to show.
    const sections: { value: string; label: string; count?: number; show: boolean; content: ReactNode }[] = [
        {
            value: 'bundle',
            label: 'Bundle contents',
            count: attachments.length,
            show: document.is_bundle,
            content: <BundleContents attachments={attachments} canManage={can.manage_attachments} onRemove={setRemoving} />,
        },
        {
            value: 'remarks',
            label: 'Remarks',
            count: remarks.length,
            show: remarks.length > 0,
            content: <RemarksList rows={remarks} />,
        },
    ];

    const tabs = sections.filter((section) => section.show);
    const current = tabs.find((section) => section.value === tab) ?? tabs[0];

    return (
        <AppLayout
            breadcrumbs={[{ title: 'Home', href: dashboard() }, { title: TRAILS[context].title, href: TRAILS[context].href() }, { title: document.control_no }]}
        >
            <Head title={document.control_no} />

            {/* Summary: what it is, what it says, where it stands. */}
            <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                    <div className="min-w-0 space-y-1">
                        <StatusBadge status={document.status} />
                        <div className="flex items-center gap-1">
                            <h1 className="truncate font-mono text-xl font-semibold sm:text-2xl">{document.control_no}</h1>
                            <CopyButton value={document.control_no} label="Copy control no." />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">
                            {document.classification}
                            {document.bundle && (
                                <span className="font-normal">
                                    {' '}
                                    · in bundle{' '}
                                    <Link href={show(document.bundle)} className="font-mono text-emerald-700 hover:underline dark:text-emerald-400">
                                        {document.bundle}
                                    </Link>
                                </span>
                            )}
                        </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                        {tools
                            .filter((tool) => tool.show)
                            .map(({ key, label, icon: Icon, onClick, href }) => (
                                <Tooltip key={key}>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" onClick={onClick} asChild={!!href} aria-label={label}>
                                            {href ? (
                                                <a href={href} target="_blank" rel="noopener">
                                                    <Icon />
                                                </a>
                                            ) : (
                                                <Icon />
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>{label}</TooltipContent>
                                </Tooltip>
                            ))}
                        {can.manage_attachments && (
                            <Button variant="outline" onClick={() => setAttaching(true)}>
                                <PackagePlus />
                                Add to bundle
                            </Button>
                        )}
                        {can.return && (
                            <Button variant="outline" onClick={() => setReturning(true)}>
                                <Undo2 />
                                Return
                            </Button>
                        )}
                        {can.receive && (
                            <Button onClick={() => setConfirmingReceive(true)} className="bg-emerald-600 text-white hover:bg-emerald-700">
                                <PackageCheck />
                                Receive
                            </Button>
                        )}
                        {can.pending && (
                            <>
                                <Button variant="outline" onClick={() => setClosing(true)}>
                                    <CircleCheckBig />
                                    Close
                                </Button>
                                <Button variant="outline" onClick={() => setEndorsing(true)}>
                                    <UserRoundCheck />
                                    Endorse
                                </Button>
                            </>
                        )}
                        {(can.forward || can.pending) && (
                            <Button onClick={() => setForwarding(true)} className="bg-emerald-600 text-white hover:bg-emerald-700">
                                <Send />
                                Forward
                            </Button>
                        )}
                        {menu.some((item) => item.show) && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" aria-label="More actions">
                                        <EllipsisVertical />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    {menu
                                        .filter((item) => item.show)
                                        .map(({ key, label, icon: Icon, onSelect, destructive }) => (
                                            <DropdownMenuItem key={key} onSelect={onSelect} variant={destructive ? 'destructive' : 'default'}>
                                                <Icon />
                                                {label}
                                            </DropdownMenuItem>
                                        ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>

                <div className="border-t px-5 py-4 sm:px-6">
                    <SubjectEditor key={document.id} documentId={document.id} subject={document.subject} editable={can.edit_subject} max={subjectMax} />
                </div>

                <div className="space-y-5 border-t bg-muted/30 px-5 py-5 sm:px-6">
                    <DeadlineBar document={document} />
                    <DescriptionList items={facts} columns={4} variant="stacked" />
                </div>
            </section>

            {tabs.length > 0 && (
                <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <ListTabs label="Document sections" value={current.value} onChange={setTab} tabs={tabs} />
                    {current.content}
                </section>
            )}

            {/* The same routing history window as the lists and search. */}
            <TrackingDialog document={tracking ? document : null} onClose={() => setTracking(false)} showOpenLink={false} />            {can.return && (
                <ReturnDialog open={returning} onOpenChange={setReturning} documentId={document.id} controlNo={document.control_no} offices={offices} sender={sender} />
            )}
            <ConfirmDialog
                open={confirmingReceive}
                onOpenChange={setConfirmingReceive}
                title={`Receive this ${kind}?`}
                description={
                    document.is_bundle
                        ? `${document.control_no} and the documents in it move to your Pending list.`
                        : `${document.control_no} moves to your Pending list.`
                }
                confirmLabel="Receive"
                onConfirm={receiveDocument}
                busy={busy}
            />
            <ForwardDialog
                open={forwarding}
                onOpenChange={setForwarding}
                documents={[document]}
                offices={offices}
                onForwarded={() => setForwarding(false)}
                // A pending document goes through the Pending forward (it may be on process
                // here rather than this office's own); a new one through My Documents'.
                action={can.pending ? pendingForward() : undefined}
            />
            {can.pending && (
                <>
                    <EndorseDialog open={endorsing} onOpenChange={setEndorsing} documentIds={[document.id]} onDone={() => undefined} />
                    <CloseDialog open={closing} onOpenChange={setClosing} documents={[document]} passwordThreshold={closePasswordThreshold} onDone={() => undefined} />
                </>
            )}
            {can.manage_attachments && (
                <AttachDialog open={attaching} onOpenChange={setAttaching} bundleId={document.id} bundleControlNo={document.control_no} candidates={attachable} />
            )}
            <ConfirmDialog
                open={removing !== null}
                onOpenChange={(open) => !open && setRemoving(null)}
                title="Remove from bundle?"
                description={`${removing?.control_no ?? ''} will stay with your office as a separate document.`}
                confirmLabel="Remove"
                onConfirm={remove}
                destructive
                busy={busy}
            />
            <ConfirmDialog
                open={deleting}
                onOpenChange={setDeleting}
                title={`Delete this ${kind}?`}
                description={`${document.control_no} and its history will be removed for good.`}
                confirmLabel="Delete"
                onConfirm={deleteDocument}
                destructive
                busy={busy}
            />
        </AppLayout>
    );
}

function BundleContents({ attachments, canManage, onRemove }: { attachments: Attachment[]; canManage: boolean; onRemove: (item: Attachment) => void }) {
    if (attachments.length === 0) {
        return <p className="px-6 py-8 text-sm text-muted-foreground">Empty. {canManage && 'Add documents before forwarding the bundle.'}</p>;
    }

    return (
        <ul className="divide-y">
            {attachments.map((item) => (
                <li key={item.id} className="flex items-center gap-3 px-5 py-3 sm:px-6">
                    <div className="min-w-0 flex-1">
                        {/* A new tab, so the bundle stays open while its documents are checked. */}
                        <a
                            href={show.url(item.control_no)}
                            target="_blank"
                            rel="noopener"
                            title="Open in a new tab"
                            className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
                        >
                            {item.control_no}
                            <ExternalLink className="size-3" aria-hidden="true" />
                        </a>
                        <p className="truncate text-xs font-medium text-muted-foreground">{item.classification}</p>
                        <p className="mt-0.5 truncate text-sm" title={item.subject}>
                            {item.subject}
                        </p>
                    </div>
                    <StatusBadge status={item.status} />
                    {item.removable && (
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onRemove(item)}
                            aria-label={`Remove ${item.control_no} from the bundle`}
                            className="hover:bg-destructive/10 hover:text-destructive"
                        >
                            <X />
                        </Button>
                    )}
                </li>
            ))}
        </ul>
    );
}

/** How much of the allowed time has passed, coloured by urgency. */
function DeadlineBar({ document }: { document: DocumentDetails }) {
    const required = Math.max(1, document.required_days);
    const left = document.days_left;
    const due = longDate.format(parseDay(document.due_date));

    if (left === null) {
        return (
            <p className="text-sm">
                <span className="text-muted-foreground">Deadline was </span>
                {due}
            </p>
        );
    }

    const used = Math.min(100, Math.max(0, ((required - left) / required) * 100));
    const plural = (n: number) => `${n} working ${n === 1 ? 'day' : 'days'}`;
    const [tone, bar, note] =
        left < 0
            ? ['text-red-700 dark:text-red-400', 'bg-red-500', `${plural(-left)} overdue`]
            : left === 0
              ? ['text-orange-700 dark:text-orange-400', 'bg-orange-500', 'Due today']
              : left <= 3
                ? ['text-yellow-700 dark:text-yellow-400', 'bg-yellow-500', `${left} of ${plural(required)} left`]
                : ['text-emerald-700 dark:text-emerald-400', 'bg-emerald-500', `${left} of ${plural(required)} left`];

    return (
        <div className="space-y-1.5">
            <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                <p>
                    <span className="text-muted-foreground">Due </span>
                    <span className="font-medium">{due}</span>
                </p>
                <p className={cn('font-medium', tone)}>{note}</p>
            </div>
            <div
                className="h-1.5 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-label="Time used"
                aria-valuenow={Math.round(used)}
                aria-valuemin={0}
                aria-valuemax={100}
            >
                <div className={cn('h-full rounded-full transition-[width]', bar)} style={{ width: `${used}%` }} />
            </div>
        </div>
    );
}

/** Every remark from the routing history, newest first. */
function RemarksList({ rows }: { rows: TimelineRow[] }) {
    return (
        <ul className="divide-y">
            {rows.map((row) => (
                <li key={row.key} className="px-5 py-3 sm:px-6">
                    <p className="text-sm whitespace-pre-line">{row.remarks}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {[row.user, row.offices.map((office) => office.name).join(' → '), row.created_at && dateTime.format(new Date(row.created_at))]
                            .filter(Boolean)
                            .join(' · ')}
                    </p>
                </li>
            ))}
        </ul>
    );
}
