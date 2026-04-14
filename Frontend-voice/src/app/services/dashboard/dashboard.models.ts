export interface FollowUpToday {
    lead_id: string;
    name: string | null;
    campaign_name: string | null;
    follow_up_date: string;
}

export interface CampaignSummary {
    campaign_id: string;
    name: string;
    status: 'draft' | 'active' | 'not active';
    leads_count: number;
}

export interface DashboardOverview {
    total_leads: number;
    total_contacts: number;
    closed_deals: number;
    total_calls: number;
    total_calls_today: number;
    follow_ups_today: FollowUpToday[];
    campaigns: CampaignSummary[];
}
