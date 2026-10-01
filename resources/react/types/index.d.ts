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

export interface SharedProps {
    app: { name: string };
    auth: { user: User | null };
    flash: { error: string | null; status: string | null };
    sidebarCounts: SidebarCounts | null;
    [key: string]: unknown;
}
