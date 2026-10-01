import { useCallback, useMemo, useState } from 'react';

/**
 * A set of picked rows that outlives the page of results it was made on: it is
 * kept across searches, filters and pages (Inertia preserves state on those
 * visits), so a batch can be assembled from several searches. Rows are kept
 * whole, so the selection can be reviewed even when they are off screen.
 * `items` lists the most recent pick first.
 */
export function useSelection<T extends { id: number }>(limit = Infinity) {
    const [map, setMap] = useState<Map<number, T>>(() => new Map());

    const add = useCallback(
        (rows: T[]) =>
            setMap((current) => {
                const next = new Map(current);

                for (const row of rows) {
                    if (next.size >= limit) {
                        break;
                    }

                    // Re-adding moves a row to the front, as the newest pick.
                    next.delete(row.id);
                    next.set(row.id, row);
                }

                return next;
            }),
        [limit],
    );

    const remove = useCallback(
        (ids: number[]) =>
            setMap((current) => {
                const next = new Map(current);
                ids.forEach((id) => next.delete(id));

                return next;
            }),
        [],
    );

    const clear = useCallback(() => setMap(new Map()), []);

    const items = useMemo(() => [...map.values()].reverse(), [map]);

    return {
        items,
        size: map.size,
        full: map.size >= limit,
        has: (id: number) => map.has(id),
        toggle: (row: T, on: boolean) => (on ? add([row]) : remove([row.id])),
        add,
        remove,
        clear,
    };
}
