import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

interface FormFieldProps {
    label: string;
    /** The control's id: links the label to it and names the hint/error ids. */
    htmlFor?: string;
    required?: boolean;
    /** Guidance shown above the control. */
    hint?: ReactNode;
    error?: string;
    children: ReactNode;
}

/**
 * One form row: label on the left from `sm` up, the control with its hint and
 * error on the right. Give the control `aria-describedby={describedBy(id, …)}`
 * so screen readers read the hint and error with it.
 */
export default function FormField({ label, htmlFor, required = false, hint, error, children }: FormFieldProps) {
    return (
        <div className="grid gap-2 px-4 py-5 sm:grid-cols-[12rem_1fr] sm:gap-6 sm:px-6">
            <Label htmlFor={htmlFor} className="sm:pt-2.5">
                {label}
                {required && (
                    <span className="text-destructive" aria-hidden="true">
                        *
                    </span>
                )}
            </Label>
            <div className="min-w-0">
                {hint && (
                    <p id={htmlFor && `${htmlFor}-hint`} className="mb-2 text-sm text-muted-foreground">
                        {hint}
                    </p>
                )}
                {children}
                {error && (
                    <p id={htmlFor && `${htmlFor}-error`} className="mt-1.5 text-sm text-destructive" role="alert">
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
}

/** The aria-describedby ids FormField renders for a control, plus any extra ids. */
export function describedBy(id: string, { hint = false, error }: { hint?: boolean; error?: string }, ...extra: string[]): string | undefined {
    const ids = [hint && `${id}-hint`, error && `${id}-error`, ...extra].filter(Boolean);

    return ids.length ? ids.join(' ') : undefined;
}
