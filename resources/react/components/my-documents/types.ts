/** A My Documents table row, as MyDocumentsController::rowMapper() sends it. */
export interface DocumentRow {
    id: number;
    control_no: string;
    subject: string;
    classification: string;
    charter: string | null;
    source: string;
    status: string;
    is_bundle: boolean;
    turnaround_days: number | null;
    destination: { code: string | null; name: string | null } | null;
    encoded_by: string | null;
    created_at: string | null;
    can_print: boolean;
    /** Gets a checkbox: a top-level document, still Created or For Receiving. */
    selectable: boolean;
}

/** An active office Forward can send to. */
export interface Office {
    id: number;
    name: string;
    code: string | null;
}
