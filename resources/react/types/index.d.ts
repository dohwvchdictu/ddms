export interface User {
    name: string;
    office: { id: number | string | null; name: string | null } | null;
    photo: string | null;
}

export interface SharedProps {
    app: { name: string };
    auth: { user: User | null };
    flash: { error: string | null; status: string | null };
    [key: string]: unknown;
}
