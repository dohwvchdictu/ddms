import { CircleCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Success {
    id: number;
    message: string;
    description?: string;
}

/** How long the overlay stays before fading out. */
const SHOW_MS = 1800;

let listener: ((success: Success) => void) | null = null;
let next = 0;

/**
 * Celebrate a finished action in the middle of the screen, for moments that
 * deserve more than a corner toast (e.g. closing documents). Controllers trigger
 * it with Inertia::flash('toast', [..., 'center' => true]); see app.tsx.
 */
export function showSuccess(message: string, description?: string): void {
    listener?.({ id: ++next, message, description });
}

/** Mounted once, next to the Toaster. Click or Esc dismisses it early. */
export default function SuccessOverlay() {
    const [success, setSuccess] = useState<Success | null>(null);
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        listener = (incoming) => {
            setLeaving(false);
            setSuccess(incoming);
        };

        return () => {
            listener = null;
        };
    }, []);

    useEffect(() => {
        if (!success) return;

        const fade = window.setTimeout(() => setLeaving(true), SHOW_MS);
        const clear = window.setTimeout(() => setSuccess(null), SHOW_MS + 250);
        const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setLeaving(true);
        document.addEventListener('keydown', onKey);

        return () => {
            window.clearTimeout(fade);
            window.clearTimeout(clear);
            document.removeEventListener('keydown', onKey);
        };
    }, [success]);

    useEffect(() => {
        if (!leaving) return;

        const clear = window.setTimeout(() => setSuccess(null), 250);

        return () => window.clearTimeout(clear);
    }, [leaving]);

    if (!success) return null;

    return (
        <div
            key={success.id}
            role="status"
            aria-live="polite"
            onClick={() => setLeaving(true)}
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/20 px-6 backdrop-blur-[2px] transition-opacity duration-200 ${leaving ? 'opacity-0' : 'animate-in fade-in'}`}
        >
            <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl border bg-background px-8 py-8 text-center shadow-2xl animate-in duration-300 zoom-in-90">
                <div className="relative flex size-16 items-center justify-center">
                    <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30 [animation-iteration-count:2]" />
                    <span className="relative flex size-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 animate-in duration-500 zoom-in-50">
                        <CircleCheck className="size-9" />
                    </span>
                </div>
                <div className="grid gap-1">
                    <p className="text-lg font-semibold tracking-tight">{success.message}</p>
                    {success.description && <p className="text-sm text-muted-foreground">{success.description}</p>}
                </div>
            </div>
        </div>
    );
}
