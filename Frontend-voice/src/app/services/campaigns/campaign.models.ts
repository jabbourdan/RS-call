// ─── Campaign Status ──────────────────────────────────────────────────────────

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';

export type CallingAlgorithm = 'priority' | 'random' | 'sequential';

// ─── Campaign Settings ────────────────────────────────────────────────────────

export interface CampaignStatusConfig {
    statuses: string[];
}

export interface CampaignSettings {
    settings_id: string;
    campaign_id: string;
    primary_phone_id: string | null;
    secondary_phone_id: string | null;
    primary_phone_number: string | null;
    secondary_phone_number: string | null;
    change_number_after: number | null;
    max_calls_to_unanswered_lead: number;
    calling_algorithm: CallingAlgorithm;
    cooldown_minutes: number;
    campaign_status: CampaignStatusConfig;
    created_at: string;
    updated_at: string;
}

// ─── Campaign ─────────────────────────────────────────────────────────────────

export interface Campaign {
    campaign_id: string;
    org_id: string;
    created_by: string;
    name: string;
    description: string | null;
    status: CampaignStatus;
    created_at: string;
    updated_at: string;
    settings: CampaignSettings;
}

// ─── Campaign Stats (from /lead_management/{id}/stats) ───────────────────────

export interface CampaignStats {
    total_leads: number;
    pending: number;
    answered: number;
    closed_deals: number;
    not_relevant: number;
    follow_up: number;
    do_not_call: number;
    calls_today: number;
    total_calls_performed: number;
}

// ─── Campaign Overview Stats (from /campaigns/all-overviews) ─────────────────

export interface CampaignOverviewStats {
    total_leads: number;
    pending: number;
    answered: number;
    not_relevant: number;
    closed_deals: number;
    follow_up: number;
    do_not_call: number;
    total_calls: number;
    answered_calls: number;
    calls_today: number;
}

// ─── Campaign Overview (from /campaigns/all-overviews) ───────────────────────

export interface CampaignOverview {
    campaign_id: string;
    name: string;
    description: string | null;
    status: CampaignStatus;
    created_at: string;
    updated_at: string;
    settings: CampaignSettings;
    stats: CampaignOverviewStats;
}

// ─── Requests ────────────────────────────────────────────────────────────────

export interface CreateCampaignRequest {
    name: string;
    description?: string;
}

export interface UpdateCampaignRequest {
    name?: string;
    description?: string;
    status?: CampaignStatus;
}

export interface UpdateCampaignSettingsRequest {
    primary_phone_id?: string | null;
    secondary_phone_id?: string | null;
    change_number_after?: number | null;
    max_calls_to_unanswered_lead?: number;
    calling_algorithm?: CallingAlgorithm;
    cooldown_minutes?: number;
    campaign_status?: CampaignStatusConfig;
}
