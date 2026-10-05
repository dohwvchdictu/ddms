export interface User {
    firstName: string;
    name: string;
    office: { id: number | string | null; name: string | null } | null;
    photo: string;
}

export interface SidebarCounts {
    incoming: number;
    pending: number;
    endorsed: number;
    total: number;
}

/** A Laravel length-aware paginator, as Inertia sends it (`->paginate()`). */
export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    from: number | null;
    to: number | null;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

/** A notification sent with Inertia::flash('toast', [...]); see app.tsx. */
export interface Toast {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    description?: string;
    /** Show it as a centred success animation instead of a corner toast. */
    center?: boolean;
}

export interface SharedProps {
    app: { name: string };
    auth: { user: User | null };
    flash: { error: string | null; status: string | null };
    sidebarCounts: SidebarCounts | null;
    [key: string]: unknown;
}
