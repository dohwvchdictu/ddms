import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

interface Options<F> {
    /** Filters typed into (search boxes) wait for a pause before reloading. */
    debounce?: (keyof F)[];
    delayMs?: number;
    /**
     * Reload only these props. Naming a deferred prop here loads it in the
     * same response, so a filter change keeps the old data on screen instead
     * of dropping back to the page's loading skeleton.
     */
    only?: string[];
}

/**
 * A server-filtered list's filters, kept in the URL. Changing one reloads the
 * page's props through Inertia (state and scroll kept, history replaced so Back
 * leaves the list instead of stepping through every keystroke) and goes back to
 * page 1, since `toUrl` builds the URL without a page number.
 */
export function useListFilters<F extends Record<string, unknown>>(initial: F, toUrl: (filters: F) => string, options: Options<F> = {}) {
    const { debounce = [], delayMs = 350, only } = options;
    const [filters, setFilters] = useState(initial);
    const [loading, setLoading] = useState(false);
    const timer = useRef<number | undefined>(undefined);

    useEffect(() => () => window.clearTimeout(timer.current), []);

    const visit = (next: F) =>
        router.get(
            toUrl(next),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                ...(only && { only }),
                onStart: () => setLoading(true),
                onFinish: () => setLoading(false),
            },
        );

    const update = (patch: Partial<F>) => {
        const next = { ...filters, ...patch };
        setFilters(next);
        window.clearTimeout(timer.current);

        if (Object.keys(patch).some((key) => debounce.includes(key as keyof F))) {
            timer.current = window.setTimeout(() => visit(next), delayMs);
        } else {
            visit(next);
        }
    };

    return { filters, update, loading };
}
