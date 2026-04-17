// ─── Org Phone Number Models ──────────────────────────────────────────────────

export interface OrgPhoneNumber {
    phone_id: string;
    org_id: string;
    phone_number: string;
    label: string | null;
    is_active: boolean;
    created_at: string;
}

// ─── Request Models ──────────────────────────────────────────────────────────

export interface CreatePhoneNumberRequest {
    phone_number: string;
    label?: string;
}

export interface UpdatePhoneNumberRequest {
    label?: string;
    is_active?: boolean;
}

export interface UpdateOrgSettingsRequest {
    max_phone_numbers: number;
}

// ─── Response Models ─────────────────────────────────────────────────────────

export interface PhoneNumberResponse extends OrgPhoneNumber {
    warning?: string;
}

export interface OrgSettingsResponse {
    org_id: string;
    org_name: string;
    max_phone_numbers: number;
}
