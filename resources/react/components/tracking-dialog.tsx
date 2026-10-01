import DocumentTracking from '@/components/document-tracking';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

interface TrackingDialogProps {
    /** The document to show; null closes the dialog. */
    document: { id: number; control_no: string } | null;
    onClose: () => void;
}

/** A document's routing trail in its own window, opened from a list row. */
export default function TrackingDialog({ document, onClose }: TrackingDialogProps) {
    return (
        <Dialog open={document !== null} onOpenChange={(open) => !open && onClose()}>
            <DialogContent showCloseButton={false} className="top-[8%] translate-y-0 gap-0 overflow-hidden p-0 shadow-2xl sm:max-w-2xl">
                <DialogTitle className="sr-only">Document tracking</DialogTitle>
                <DialogDescription className="sr-only">The routing history of {document?.control_no}.</DialogDescription>
                {document && (
                    <DocumentTracking
                        documentId={document.id}
                        controlNo={document.control_no}
                        onBack={onClose}
                        backLabel="Close"
                        hint="Press Esc to close."
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
