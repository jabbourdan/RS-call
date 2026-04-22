import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    Campaign,
    CampaignOverview,
    CampaignSettings,
    CampaignStats,
    CreateCampaignRequest,
    UpdateCampaignRequest,
    UpdateCampaignSettingsRequest,
} from './campaign.models';

@Injectable({ providedIn: 'root' })
export class CampaignService {

    private readonly base = `${environment.apiUrl}/campaigns`;
    private readonly leadMgmt = `${environment.apiUrl}/lead_management`;

    private _defaultPrompt$ = new ReplaySubject<{ default_prompt: string }>(1);
    private _defaultPromptLoaded = false;

    constructor(private http: HttpClient) {}

    // ─── List all campaigns with settings + stats (single request) ───────────────

    allOverviews(): Observable<CampaignOverview[]> {
        return this.http.get<CampaignOverview[]>(`${this.base}/all-overviews`, { withCredentials: true });
    }

    // ─── List (basic, no stats) ──────────────────────────────────────────────────

    list(): Observable<Campaign[]> {
        return this.http.get<Campaign[]>(`${this.base}/`, { withCredentials: true });
    }

    // ─── Get Single ──────────────────────────────────────────────────────────────

    getById(campaignId: string): Observable<Campaign> {
        return this.http.get<Campaign>(`${this.base}/${campaignId}`, { withCredentials: true });
    }

    // ─── Create ──────────────────────────────────────────────────────────────────

    create(body: CreateCampaignRequest): Observable<Campaign> {
        return this.http.post<Campaign>(`${this.base}/`, body, { withCredentials: true });
    }

    // ─── Update ──────────────────────────────────────────────────────────────────

    update(campaignId: string, body: UpdateCampaignRequest): Observable<Campaign> {
        return this.http.patch<Campaign>(`${this.base}/${campaignId}`, body, { withCredentials: true });
    }

    // ─── Update Settings ─────────────────────────────────────────────────────────

    updateSettings(campaignId: string, body: UpdateCampaignSettingsRequest): Observable<CampaignSettings> {
        return this.http.patch<CampaignSettings>(
            `${this.base}/${campaignId}/settings`,
            body,
            { withCredentials: true }
        );
    }

    // ─── Delete ──────────────────────────────────────────────────────────────────

    delete(campaignId: string): Observable<void> {
        return this.http.delete<void>(`${this.base}/${campaignId}`, { withCredentials: true });
    }

    // ─── Default Summary Prompt (cached for session) ──────────────────────────────

    getDefaultSummaryPrompt(): Observable<{ default_prompt: string }> {
        if (!this._defaultPromptLoaded) {
            this._defaultPromptLoaded = true;
            this.http
                .get<{ default_prompt: string }>(`${this.base}/summary-prompt/default`, { withCredentials: true })
                .pipe(tap(v => this._defaultPrompt$.next(v)))
                .subscribe({ error: () => { this._defaultPromptLoaded = false; } });
        }
        return this._defaultPrompt$.asObservable();
    }

    // ─── Stats (single campaign fallback) ────────────────────────────────────────

    getStats(campaignId: string): Observable<CampaignStats> {
        return this.http.get<CampaignStats>(
            `${this.leadMgmt}/${campaignId}/stats`,
            { withCredentials: true }
        );
    }
}
