import { useCallback, useState } from 'react';

export interface TablePreferences {
    /** Ids of the columns the viewer has hidden. */
    hidden: string[];
    /** Tighter rows, to see more at once. */
    dense: boolean;
}

const DEFAULTS: TablePreferences = { hidden: [], dense: false };

function read(key: string): TablePreferences {
    try {
        const stored = JSON.parse(localStorage.getItem(key) ?? 'null');

        return {
            hidden: Array.isArray(stored?.hidden) ? stored.hidden.filter((id: unknown) => typeof id === 'string') : [],
            dense: stored?.dense === true,
        };
    } catch {
        return DEFAULTS;
    }
}

/**
 * How one viewer likes a table laid out (hidden columns, density), remembered
 * in this browser. Only a convenience: blocked storage just means the defaults.
 */
export function useTablePreferences(tableId: string) {
    const key = `table:${tableId}`;
    const [preferences, setPreferences] = useState<TablePreferences>(() => read(key));

    const update = useCallback(
        (patch: Partial<TablePreferences>) =>
            setPreferences((current) => {
                const next = { ...current, ...patch };

                try {
                    localStorage.setItem(key, JSON.stringify(next));
                } catch {
                    // Storage blocked: the choice lasts for this page view only.
                }

                return next;
            }),
        [key],
    );

    return {
        preferences,
        isVisible: (column: string) => !preferences.hidden.includes(column),
        toggleColumn: (column: string, visible: boolean) =>
            update({ hidden: visible ? preferences.hidden.filter((id) => id !== column) : [...new Set([...preferences.hidden, column])] }),
        setDense: (dense: boolean) => update({ dense }),
    };
}
