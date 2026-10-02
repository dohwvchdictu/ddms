import { Loader2, Printer } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';

interface TransmittalFormDialogProps {
    /** The document whose form to show; null closes the dialog. */
    controlNo: string | null;
    onClose: () => void;
}

/** The printable form's page; `embed=1` stops it printing itself on load, so it can be previewed first. */
const formUrl = (controlNo: string) => `/print-transmittal-form/${encodeURIComponent(controlNo)}?embed=1`;

/** The form is laid out at paper width (8.5in at 96 dpi), as it prints. */
const PAPER_WIDTH = 816;

/** Until the form has loaded and been measured: a letter-size page. */
const PAPER_HEIGHT = 1056;

/** The widest the preview gets, however wide the window. */
const MAX_PREVIEW_WIDTH = 720;

/** The window's margin around the dialog (2rem) plus the stage's side padding (2rem). */
const SIDE_GAPS = 64;

/**
 * The Document Tracking Form, previewed in a window over the page and printed
 * from there. The form itself is the server's print page, unchanged, in a frame
 * laid out at paper width and scaled down to fit whole; the scaling is on the
 * frame, not the form, so Print still prints it at full size.
 */
export default function TransmittalFormDialog({ controlNo, onClose }: TransmittalFormDialogProps) {
    const frame = useRef<HTMLIFrameElement>(null);
    // State, not a ref: the dialog mounts its content a render after opening, so
    // the observer below has to start when this element appears, not on open.
    const [stage, setStage] = useState<HTMLDivElement | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [formHeight, setFormHeight] = useState(PAPER_HEIGHT);
    const [space, setSpace] = useState({ width: 0, height: 0 });

    // A new document loads a new form.
    useEffect(() => {
        setLoaded(false);
        setFormHeight(PAPER_HEIGHT);
    }, [controlNo]);

    // The room the preview has, kept up to date as the window resizes.
    // The height is the stage's; the width is the window's, since the dialog
    // itself takes the form's width (so it has no empty sides).
    useEffect(() => {
        if (!stage) return;

        const measure = () => setSpace({ width: Math.min(window.innerWidth - SIDE_GAPS, MAX_PREVIEW_WIDTH), height: stage.clientHeight });
        measure();

        const observer = new ResizeObserver(measure);
        observer.observe(stage);
        window.addEventListener('resize', measure);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, [stage]);

    const onLoad = () => {
        const page = frame.current?.contentDocument?.documentElement;

        if (page) setFormHeight(Math.max(page.scrollHeight, 1));

        setLoaded(true);
    };

    // Small enough for the whole form to show, never larger than life.
    const scale = space.width > 0 ? Math.min(space.width / PAPER_WIDTH, space.height / formHeight, 1) : 0;

    const print = () => {
        const view = frame.current?.contentWindow;

        if (!view) return;

        view.focus();
        view.print();
    };

    return (
        <Dialog open={controlNo !== null} onOpenChange={(open) => !open && onClose()}>
            {/* As wide as the scaled form, not a fixed size. */}
            <DialogContent className="flex max-h-[94dvh] w-auto flex-col gap-0 overflow-hidden p-0 sm:max-w-none">
                {/* No visible header: the form shows what it is. Kept for screen readers. */}
                <DialogTitle className="sr-only">Document Tracking Form</DialogTitle>
                <DialogDescription className="sr-only">The Document Tracking Form for {controlNo}, ready to print.</DialogDescription>

                <div className="bg-muted/50 px-4 pt-12 pb-4">
                    {/* The window's height less the top gap and the footer, so the buttons always show. */}
                    <div ref={setStage} className="relative flex h-[calc(94dvh-9rem)] justify-center">
                        {!loaded && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="size-4 animate-spin" />
                                Preparing the form…
                            </div>
                        )}
                        {controlNo && (
                            // Takes the scaled size, so the page sits centred with no scrollbars.
                            <div
                                className="overflow-hidden rounded-sm bg-white shadow-md ring-1 ring-black/5"
                                style={{ width: PAPER_WIDTH * scale, height: formHeight * scale, visibility: loaded ? 'visible' : 'hidden' }}
                            >
                                <iframe
                                    ref={frame}
                                    key={controlNo}
                                    src={formUrl(controlNo)}
                                    title={`Document Tracking Form for ${controlNo}`}
                                    onLoad={onLoad}
                                    scrolling="no"
                                    style={{ width: PAPER_WIDTH, height: formHeight, transform: `scale(${scale})`, transformOrigin: 'top left' }}
                                    className="block border-0 bg-white"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="border-t bg-muted/30 px-6 py-4 sm:items-center">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    <Button onClick={print} disabled={!loaded} className="bg-emerald-600 text-white hover:bg-emerald-700">
                        <Printer />
                        Print
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
