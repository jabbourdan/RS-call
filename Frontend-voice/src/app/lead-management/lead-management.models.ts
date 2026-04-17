// ─── Timeline Event Types ────────────────────────────────────────────────────

export type TimelineEventType =
    | 'follow_up_scheduled'
    | 'outgoing_call'
    | 'incoming_call'
    | 'call_ended'
    | 'ai_summary'
    | 'comment'
    | 'status_change'
    | 'lead_created';

export type CallDirection = 'inbound' | 'outbound';

// ─── Timeline Event ──────────────────────────────────────────────────────────

export interface TimelineEvent {
    id: string;
    type: TimelineEventType;
    timestamp: string;                 // ISO date string
    agent_name: string | null;
    /** For follow_up_scheduled */
    follow_up_date?: string | null;
    follow_up_comment?: string | null;
    /** For outgoing_call / incoming_call */
    phone_number?: string | null;
    direction?: CallDirection;
    call_duration?: number | null;     // seconds
    is_auto_dialer?: boolean;
    call_attempt?: number | null;      // e.g. "call (1)" from phone #2
    /** For call_ended */
    duration_seconds?: number | null;
    /** For ai_summary */
    ai_summary_text?: string | null;
    ai_disclaimer?: boolean;
    /** For comment */
    comment_text?: string | null;
    /** For status_change */
    old_status?: string | null;
    new_status?: string | null;
}

// ─── Performance Stats ───────────────────────────────────────────────────────

export interface PerformanceStats {
    todays_follow_up_calls: number;
    closed_deals: number;
    calls_with_new_customers: number;
    total_managed_calls: number;
    total_time_in_calls: number;       // seconds
}

// ─── Mock Lead (extended for the management view) ────────────────────────────

export interface LeadManagementItem {
    lead_id: string;
    campaign_id: string;
    campaign_name: string;
    phone_number: string;
    name: string;
    email: string | null;
    status: {
        current: string;
        options: string[];
    };
    follow_up_date: string | null;
    creation_note: string | null;
    tried_to_reach: number;
    sum_calls_performed: number;
    last_call_at: string | null;
    created_at: string;
    extra_data: Record<string, unknown> | null;
}

// ─── Representative ──────────────────────────────────────────────────────────

export interface Representative {
    user_id: string;
    name: string;
    is_me: boolean;
}

// ─── Call Status Info (top bar) ──────────────────────────────────────────────

export interface CallStatusInfo {
    status_label: string;
    follow_up_date: string | null;
    follow_up_time: string | null;
}

// ─── Campaign Option (for dropdown) ──────────────────────────────────────────

export interface CampaignOption {
    campaign_id: string;
    name: string;
}

// ─── Keypad Key ──────────────────────────────────────────────────────────────

export type KeypadKey = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '*' | '0' | '#';

// ─── Roll Stats (live UI state) ──────────────────────────────────────────────

/** Live roll stats displayed in the UI */
export interface RollStats {
    isActive: boolean;
    isPaused: boolean;
    callsMade: number;
    callsAnswered: number;
    callsNoAnswer: number;
    leadsRemaining: number;
    currentCallId?: string | null;
    currentLead: {
        leadId: string;
        name: string;
        phoneNumber: string;
        callStatus: string | null;
    } | null;
}

// ─── Mapper: backend API events → UI TimelineEvent[] ─────────────────────────
// Backend has 5 event types; UI has 8. A backend 'call' becomes 'outgoing_call'
// or 'incoming_call'. A 'status_change' with a follow_up_date also emits an
// additional 'follow_up_scheduled' event directly after it.

import type { TimelineEventFromAPI } from '../services/lead-management/lead-management-api.models';

export function mapApiEventsToUi(apiEvents: TimelineEventFromAPI[]): TimelineEvent[] {
    const result: TimelineEvent[] = [];

    for (const ev of apiEvents) {
        switch (ev.type) {

            case 'call': {
                const d = ev.data;
                const uiType: TimelineEventType = d.direction === 'inbound'
                    ? 'incoming_call'
                    : 'outgoing_call';
                result.push({
                    id: ev.event_id,
                    type: uiType,
                    timestamp: ev.timestamp,
                    agent_name: ev.agent_name,
                    phone_number: d.destination,
                    direction: d.direction,
                    call_duration: d.duration,
                    duration_seconds: d.duration,
                    is_auto_dialer: d.is_roll,
                });
                break;
            }

            case 'ai_summary': {
                const d = ev.data;
                result.push({
                    id: ev.event_id,
                    type: 'ai_summary',
                    timestamp: ev.timestamp,
                    agent_name: ev.agent_name,
                    ai_summary_text: d.summary,
                    ai_disclaimer: d.summary?.includes('פחות מ') ?? false,
                });
                break;
            }

            case 'comment': {
                const d = ev.data;
                result.push({
                    id: ev.event_id,
                    type: 'comment',
                    timestamp: ev.timestamp,
                    agent_name: ev.agent_name,
                    comment_text: d.content,
                });
                break;
            }

            case 'status_change': {
                const d = ev.data;
                result.push({
                    id: ev.event_id,
                    type: 'status_change',
                    timestamp: ev.timestamp,
                    agent_name: ev.agent_name,
                    old_status: d.old_status,
                    new_status: d.new_status,
                });
                // If there's a follow-up date, also emit a follow_up_scheduled bubble
                if (d.follow_up_date) {
                    result.push({
                        id: `${ev.event_id}-followup`,
                        type: 'follow_up_scheduled',
                        timestamp: ev.timestamp,
                        agent_name: ev.agent_name,
                        follow_up_date: d.follow_up_date,
                        follow_up_comment: d.comment,
                    });
                }
                break;
            }

            case 'lead_created': {
                const d = ev.data;
                result.push({
                    id: ev.event_id,
                    type: 'lead_created',
                    timestamp: ev.timestamp,
                    agent_name: ev.agent_name,
                    phone_number: d.phone,
                });
                break;
            }
        }
    }

    return result;
}
