// ─── Raw event shapes from backend ──────────────────────────────────────────

export interface ApiCallData {
    call_id?: string;
    direction: 'inbound' | 'outbound';
    duration: number | null;
    status: string;
    destination: string | null;
    number_called_from?: string | null;
    is_roll: boolean;
    recording_url?: string | null;
    twilio_sid?: string | null;
}

export interface ApiAiSummaryData {
    analysis_id?: string;
    call_id?: string;
    summary: string;
    sentiment: string | null;
    key_points?: unknown[];
    next_action?: string | null;
    transcript?: string | null;
    transcription_status?: string;
    summary_sections?: StructuredSummary | null;
    summary_status?: SummaryStatus;
    prompt_version_used?: PromptVersion | null;
}

export type SummaryStatus = 'generating' | 'available' | 'failed' | 'unstructured_legacy';
export type PromptVersion = 'default' | 'campaign_override';

export interface StructuredSummaryTopic {
    title: string;
    detail: string;
}

export interface StructuredSummaryLogistics {
    meeting_time: string | null;
    location: string | null;
    notes: string | null;
}

export interface StructuredSummary {
    purpose?: string | null;
    main_topics?: StructuredSummaryTopic[];
    resolution?: string | null;
    follow_ups?: string[];
    logistics?: StructuredSummaryLogistics | null;
    action_items?: string[];
}

export interface ApiCommentData {
    comment_id?: string;
    content: string;
    created_at?: string;
}

export interface ApiStatusChangeData {
    history_id?: string;
    old_status: string;
    new_status: string;
    follow_up_date: string | null;
    comment: string | null;
}

export interface ApiLeadCreatedData {
    lead_id?: string;
    name: string | null;
    phone: string | null;
    campaign_name?: string | null;
    extra_data?: Record<string, unknown> | null;
}

// ─── Discriminated union ─────────────────────────────────────────────────────

export type TimelineEventFromAPI =
    | { event_id: string; type: 'call';           timestamp: string; agent_name: string | null; agent_id: string | null; data: ApiCallData }
    | { event_id: string; type: 'ai_summary';     timestamp: string; agent_name: string | null; agent_id: string | null; data: ApiAiSummaryData }
    | { event_id: string; type: 'comment';        timestamp: string; agent_name: string | null; agent_id: string | null; data: ApiCommentData }
    | { event_id: string; type: 'status_change';  timestamp: string; agent_name: string | null; agent_id: string | null; data: ApiStatusChangeData }
    | { event_id: string; type: 'lead_created';   timestamp: string; agent_name: string | null; agent_id: string | null; data: ApiLeadCreatedData };

// ─── Lead Summary (returned from full timeline endpoint) ─────────────────────

export interface LeadSummary {
    name: string | null;
    phone_number: string | null;
    campaign_name: string | null;
    campaign_id: string | null;
    current_status: string;
    follow_up_date: string | null;
    total_calls: number;
    last_call_at: string | null;
    created_at: string;
    created_by: string | null;
    extra_data: Record<string, unknown> | null;
}

// ─── Full timeline response ──────────────────────────────────────────────────

export interface FullTimelineResponse {
    lead_id: string;
    total_events: number;
    page: number;
    page_size: number;
    lead_summary: LeadSummary;
    events: TimelineEventFromAPI[];
}

// ─── Simple timeline response (for reference) ────────────────────────────────

export interface SimpleTimelineResponse {
    lead_id: string;
    total_events: number;
    page: number;
    page_size: number;
    events: TimelineEventFromAPI[];
}

// ─── Update status ───────────────────────────────────────────────────────────

export interface UpdateStatusRequest {
    status: string;
    follow_up_date?: string | null;
    comment?: string | null;
}

export interface UpdateStatusResponse {
    lead_id: string;
    name: string | null;
    old_status: string;
    new_status: string;
    follow_up_date: string | null;
    updated_at: string;
}

// ─── Start call ──────────────────────────────────────────────────────────────

export interface StartCallRequest {
    lead_id: string;
    campaign_id: string;
}

export interface StartCallResponse {
    call_id: string;
    status: string;
    to: string;
    lead_name: string;
}

export interface HangupResponse {
    status: 'terminated';
    call_id: string;
}

// ─── Add comment response ────────────────────────────────────────────────────

export interface AddCommentResponse {
    comment_id: string;
    lead_id: string;
    user_id: string;
    agent_name: string | null;
    content: string;
    created_at: string;
}

// ─── Campaign stats ───────────────────────────────────────────────────────────

export interface CampaignStatsResponse {
    total_leads: number;
    pending: number;
    answered: number;
    not_relevant: number;
    closed_deals: number;
    follow_up: number;
    do_not_call: number;
    total_calls?: number;
    answered_calls?: number;
    calls_today?: number;
}

// ─── Org user (from GET /auth/users) ─────────────────────────────────────────

export interface OrgUser {
    user_id: string;
    org_id: string;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
    created_at: string;
}

// ─── Roll Calling ────────────────────────────────────────────────────────────

export interface StartRollRequest {
    campaign_id: string;
}

export interface StartRollResponse {
    status: 'started' | 'stopped';
    campaign_id: string;
    call_id?: string;
    reason?: string;
    current_lead?: RollCurrentLead;
}

export interface StopRollRequest {
    campaign_id: string;
}

export interface StopRollResponse {
    status: 'stopped' | 'already_stopped';
    campaign_id: string;
    message: string;
}

export interface RollCurrentLead {
    lead_id: string;
    name: string;
    phone_number: string;
    call_status?: string;
}

export interface RollStatusResponse {
    roll_active: boolean;
    roll_paused: boolean;
    campaign_id: string;
    calls_made: number;
    calls_answered: number;
    calls_no_answer: number;
    leads_remaining: number;
    current_call_id: string | null;
    current_lead: RollCurrentLead | null;
}

export interface ProceedRollRequest {
    campaign_id: string;
}

export type ProceedRollResponse = RollStatusResponse;

// ─── Twilio Token ────────────────────────────────────────────────────────────

export interface TwilioTokenResponse {
    token: string;
    identity: string;
}
