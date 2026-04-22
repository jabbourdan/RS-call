// ─── Lead Status ─────────────────────────────────────────────────────────────

export type LeadStatusValue =
    | 'ממתין'
    | 'ענה'
    | 'לא רלוונטי'
    | 'עסקה נסגרה'
    | 'פולו אפ'
    | 'אל תתקשר';

export interface LeadStatus {
    current: LeadStatusValue;
    options: LeadStatusValue[];
}

// ─── Lead ─────────────────────────────────────────────────────────────────────

export interface Lead {
    lead_id: string;
    campaign_id: string;
    org_id: string;
    phone_number: string | null;
    name: string | null;
    email: string | null;
    status: LeadStatus;
    extra_data: Record<string, unknown> | null;
    tried_to_reach: number;
    sum_calls_performed: number;
    last_call_at: string | null;
    follow_up_date: string | null;
    created_at: string;
    /** Enriched on the frontend when fetching "All Campaigns" */
    campaign_name?: string | null;
}

// ─── Requests ────────────────────────────────────────────────────────────────

export interface LeadCreateRequest {
    phone_number: string;           // required
    name?: string;
    email?: string;
    extra_data?: Record<string, unknown>;
}

export interface LeadUpdateRequest {
    phone_number?: string;
    name?: string;
    email?: string;
    status?: string;
    follow_up_date?: string | null;
    extra_data?: Record<string, unknown>;
}

// ─── Upload / Preview ────────────────────────────────────────────────────────

export interface LeadPreviewColumnsResponse {
    columns: string[];
}

export interface LeadUploadResponse {
    total_rows: number;
    imported: number;
    skipped_duplicates: number;
    failed_invalid: number;
    errors: string[];
}

// ─── Lead Briefing ───────────────────────────────────────────────────────────

export interface LeadBriefing {
    briefing_id: string;
    lead_id: string;
    briefing_text: string;
    prompt_version: string;
    generated_at: string;    // ISO-8601 timestamp
    generated_by: string;
}
