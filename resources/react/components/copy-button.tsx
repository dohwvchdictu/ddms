import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
    value: string;
    /** What is being copied, for the tooltip and screen readers. */
    label?: string;
    className?: string;
}

const COPIED_MS = 1500;

/** An icon button that copies `value` to the clipboard and ticks for a moment. */
export default function CopyButton({ value, label = 'Copy', className }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) {
            return;
        }

        const timer = window.setTimeout(() => setCopied(false), COPIED_MS);

        return () => window.clearTimeout(timer);
    }, [copied]);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
        } catch {
            // Clipboard blocked (no HTTPS, browser policy): say so instead of failing silently.
            toast.error('Could not copy. Select the text and copy it instead.');
        }
    };

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button type="button" variant="ghost" size="icon-sm" onClick={copy} aria-label={label} className={cn('shrink-0', className)}>
                    {copied ? <Check className="text-emerald-600" /> : <Copy />}
                </Button>
            </TooltipTrigger>
            <TooltipContent>{copied ? 'Copied' : label}</TooltipContent>
        </Tooltip>
    );
}
