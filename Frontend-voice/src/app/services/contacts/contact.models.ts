// ─── Contact Model ─────────────────────────────────────────────────────────────

export interface Contact {
    contact_id: string;
    org_id: string;
    name: string;
    phone_number: string | null;
    email: string | null;
    extra_data: Record<string, unknown> | null;
    created_at: string;
}

// ─── Create / Update Request Models ───────────────────────────────────────────

export interface ContactCreateRequest {
    /** Required — must not be blank */
    name: string;
    phone_number?: string;
    email?: string;
    extra_data?: Record<string, unknown>;
}

export interface ContactUpdateRequest {
    name?: string;
    phone_number?: string;
    email?: string;
    extra_data?: Record<string, unknown>;
}

// ─── Bulk Upload Models ────────────────────────────────────────────────────────

export interface ContactPreviewColumnsResponse {
    columns: string[];
    sample_rows: Record<string, string>[];
    total_columns: number;
}

export interface ContactUploadResponse {
    total_rows: number;
    imported: number;
    skipped: number;
    errors: string[];
}
