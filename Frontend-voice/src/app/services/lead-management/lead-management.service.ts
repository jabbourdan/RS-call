import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    AddCommentResponse,
    CampaignStatsResponse,
    FullTimelineResponse,
    HangupResponse,
    OrgUser,
    ProceedRollResponse,
    RollStatusResponse,
    StartCallResponse,
    StartRollResponse,
    StopRollResponse,
    TwilioTokenResponse,
    UpdateStatusRequest,
    UpdateStatusResponse,
} from './lead-management-api.models';

@Injectable({ providedIn: 'root' })
export class LeadManagementService {

    private readonly leadMgmt = `${environment.apiUrl}/lead_management`;
    private readonly calls    = `${environment.apiUrl}/calls`;
    private readonly auth     = `${environment.apiUrl}/auth`;

    constructor(private http: HttpClient) {}

    // ─── Full timeline (with lead_summary) ───────────────────────────────────

    getFullTimeline(
        leadId: string,
        page = 1,
        pageSize = 200,
        type?: string,
    ): Observable<FullTimelineResponse> {
        let params = new HttpParams()
            .set('page', page)
            .set('page_size', pageSize);
        if (type) {
            params = params.set('type', type);
        }
        return this.http.get<FullTimelineResponse>(
            `${this.leadMgmt}/${leadId}/timeline/full`,
            { params, withCredentials: true },
        );
    }

    // ─── Add comment ─────────────────────────────────────────────────────────

    addComment(leadId: string, content: string): Observable<AddCommentResponse> {
        return this.http.post<AddCommentResponse>(
            `${this.leadMgmt}/${leadId}/comments`,
            { content },
            { withCredentials: true },
        );
    }

    // ─── Update lead status ───────────────────────────────────────────────────

    updateStatus(
        campaignId: string,
        leadId: string,
        body: UpdateStatusRequest,
    ): Observable<UpdateStatusResponse> {
        return this.http.patch<UpdateStatusResponse>(
            `${this.leadMgmt}/${campaignId}/leads/${leadId}/status`,
            body,
            { withCredentials: true },
        );
    }

    // ─── Delete lead ─────────────────────────────────────────────────────────

    deleteLead(campaignId: string, leadId: string): Observable<{ status: string; lead_id: string }> {
        return this.http.delete<{ status: string; lead_id: string }>(
            `${this.leadMgmt}/${campaignId}/leads/${leadId}`,
            { withCredentials: true },
        );
    }

    // ─── Campaign stats ───────────────────────────────────────────────────────

    getCampaignStats(campaignId: string): Observable<CampaignStatsResponse> {
        return this.http.get<CampaignStatsResponse>(
            `${this.leadMgmt}/${campaignId}/stats`,
            { withCredentials: true },
        );
    }

    // ─── Start call (single manual call via conference bridge) ───────────

    startCall(leadId: string, campaignId: string): Observable<StartCallResponse> {
        return this.http.post<StartCallResponse>(
            `${this.calls}/start`,
            { lead_id: leadId, campaign_id: campaignId },
            { withCredentials: true },
        );
    }

    // ─── Hang up a call ───────────────────────────────────────────────────

    hangupCall(callId: string): Observable<HangupResponse> {
        return this.http.post<HangupResponse>(
            `${this.calls}/${callId}/hangup`,
            {},
            { withCredentials: true },
        );
    }

    // ─── Roll calling ─────────────────────────────────────────────────────────────

    startRoll(campaignId: string): Observable<StartRollResponse> {
        return this.http.post<StartRollResponse>(
            `${this.calls}/start-roll`,
            { campaign_id: campaignId },
            { withCredentials: true },
        );
    }

    stopRoll(campaignId: string): Observable<StopRollResponse> {
        return this.http.post<StopRollResponse>(
            `${this.calls}/stop-roll`,
            { campaign_id: campaignId },
            { withCredentials: true },
        );
    }

    getRollStatus(campaignId: string): Observable<RollStatusResponse> {
        return this.http.get<RollStatusResponse>(
            `${this.calls}/roll-status/${campaignId}`,
            { withCredentials: true },
        );
    }

    proceedRoll(campaignId: string): Observable<ProceedRollResponse> {
        return this.http.post<ProceedRollResponse>(
            `${this.calls}/roll/proceed`,
            { campaign_id: campaignId },
            { withCredentials: true },
        );
    }

    // ─── Twilio token ─────────────────────────────────────────────────────────────

    getTwilioToken(): Observable<TwilioTokenResponse> {
        return this.http.post<TwilioTokenResponse>(
            `${this.calls}/token`,
            {},
            { withCredentials: true },
        );
    }

    // ─── Get all org users (for representatives dropdown) ────────────────────

    getOrgUsers(): Observable<OrgUser[]> {
        return this.http.get<OrgUser[]>(`${this.auth}/users`, { withCredentials: true });
    }
}
