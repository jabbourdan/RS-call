import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { LeadManagementService } from '../services/lead-management/lead-management.service';
import { TwilioVoiceService } from './twilio-voice.service';
import { RollStats } from './lead-management.models';

/**
 * RollService — orchestrator for the Auto-Dialer (Roll) feature.
 *
 * Responsibilities:
 *  - Start / stop a roll via backend
 *  - Initialize / destroy Twilio Device through TwilioVoiceService
 *  - Poll roll status every N seconds while active
 *  - Expose reactive state (rollStats$, isActive$, error$, currentLeadChanged$)
 *  - Detect natural roll completion (backend returns roll_active: false)
 *  - Clean up everything on destroy or campaign switch
 */
@Injectable({ providedIn: 'root' })
export class RollService implements OnDestroy {

    // ── Configuration ────────────────────────────────────────────────────────
    private readonly POLL_INTERVAL = 4000; // 4 seconds

    // ── Internal state ───────────────────────────────────────────────────────
    private pollTimer: ReturnType<typeof setInterval> | null = null;
    private activeCampaignId: string | null = null;
    private lastLeadId: string | null = null;
    private readonly destroy$ = new Subject<void>();

    // ── Public observables ───────────────────────────────────────────────────
    private readonly _isActive$ = new BehaviorSubject<boolean>(false);
    private readonly _rollStats$ = new BehaviorSubject<RollStats | null>(null);
    private readonly _error$ = new BehaviorSubject<string>('');
    private readonly _currentLeadChanged$ = new Subject<string>(); // emits lead_id

    readonly isActive$: Observable<boolean> = this._isActive$.asObservable();
    readonly rollStats$: Observable<RollStats | null> = this._rollStats$.asObservable();
    readonly error$: Observable<string> = this._error$.asObservable();
    /** Fires every time the roll moves to a NEW lead (different lead_id) */
    readonly currentLeadChanged$: Observable<string> = this._currentLeadChanged$.asObservable();

    // ── Getters for synchronous checks ───────────────────────────────────
    get isActive(): boolean { return this._isActive$.getValue(); }
    get rollStats(): RollStats | null { return this._rollStats$.getValue(); }

    /** Clear the current error message */
    clearError(): void {
        this._error$.next('');
    }

    constructor(
        private lmService: LeadManagementService,
        private twilioService: TwilioVoiceService,
    ) {}

    // ── Start Roll ───────────────────────────────────────────────────────────

    /**
     * Start an auto-dialer roll for the given campaign.
     * Flow (matching backend docs):
     *   1. Initialize Twilio Device (fetch token + register) — agent must be connected first
     *   2. Call backend start-roll — backend starts dialing leads
     *   3. Start polling roll status
     */
    async startRoll(campaignId: string): Promise<void> {
        if (this._isActive$.getValue()) return; // already running

        this._error$.next('');
        this.activeCampaignId = campaignId;

        // Step 1: Initialize Twilio Device FIRST — the backend needs the agent
        //         to be registered before it can bridge calls.
        try {
            await this.twilioService.initialize();
        } catch (err) {
            this._error$.next('LEAD_MANAGEMENT.ROLL_ERROR_TWILIO_INIT');
            this.activeCampaignId = null;
            return;
        }

        // Step 2: Now tell the backend to start the roll
        this.lmService.startRoll(campaignId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    // Backend returns status: 'started' or 'stopped'
                    // 'stopped' = no leads available to call
                    if (res.status === 'stopped') {
                        this._error$.next('LEAD_MANAGEMENT.ROLL_ERROR_NO_LEADS');
                        this._isActive$.next(false);
                        this.twilioService.destroy();
                        this.activeCampaignId = null;
                        return;
                    }

                    this._isActive$.next(true);
                    this.startPolling();
                },
                error: (err) => {
                    this._error$.next('LEAD_MANAGEMENT.ROLL_ERROR_START_FAILED');
                    this._isActive$.next(false);
                    // Twilio was initialized but roll failed — clean up
                    this.twilioService.destroy();
                    this.activeCampaignId = null;
                },
            });
    }

    // ── Stop Roll ────────────────────────────────────────────────────────────

    /**
     * Stop the active roll.
     * 1. Call backend stop-roll
     * 2. Hangup + destroy Twilio Device
     * 3. Stop polling
     * 4. Reset all state
     */
    stopRoll(campaignId?: string): void {
        const cid = campaignId ?? this.activeCampaignId;
        if (!cid) return;

        this.lmService.stopRoll(cid)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => this.resetAll(),
                error: () => {
                    // Even if the backend call fails, clean up locally
                    this.resetAll();
                },
            });
    }

    // ── Cleanup (no backend call) ────────────────────────────────────────────

    /**
     * Clean up local state without calling the backend stop-roll.
     * Used when the component is destroyed or the user switches campaigns.
     * If a roll was active, it also calls stop-roll on the backend.
     */
    cleanup(): void {
        if (this._isActive$.getValue() && this.activeCampaignId) {
            // Fire-and-forget stop-roll to the backend
            this.lmService.stopRoll(this.activeCampaignId).subscribe();
        }
        this.resetAll();
    }

    // ── Polling ──────────────────────────────────────────────────────────────

    private startPolling(): void {
        this.stopPolling(); // safety — clear any existing timer
        this.pollRollStatus(); // immediate first poll
        this.pollTimer = setInterval(() => {
            this.pollRollStatus();
        }, this.POLL_INTERVAL);
    }

    private stopPolling(): void {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }
    }

    private pollRollStatus(): void {
        if (!this.activeCampaignId) return;

        this.lmService.getRollStatus(this.activeCampaignId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (!res.roll_active) {
                        // Roll finished naturally (all leads called)
                        this.resetAll();
                        return;
                    }

                    const stats: RollStats = {
                        isActive: res.roll_active,
                        callsMade: res.calls_made,
                        callsAnswered: res.calls_answered,
                        callsNoAnswer: res.calls_no_answer,
                        leadsRemaining: res.leads_remaining,
                        currentLead: res.current_lead
                            ? {
                                leadId: res.current_lead.lead_id,
                                name: res.current_lead.name,
                                phoneNumber: res.current_lead.phone_number,
                                callStatus: res.current_lead.call_status ?? null,
                            }
                            : null,
                    };

                    this._rollStats$.next(stats);

                    // Detect lead change → emit so the parent can auto-select
                    if (res.current_lead && res.current_lead.lead_id !== this.lastLeadId) {
                        this.lastLeadId = res.current_lead.lead_id;
                        this._currentLeadChanged$.next(res.current_lead.lead_id);
                    }
                },
                error: () => {
                    // On error stop polling to avoid hammering server
                    this._error$.next('LEAD_MANAGEMENT.ROLL_ERROR_CONNECTION_LOST');
                    this.resetAll();
                },
            });
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private resetAll(): void {
        this.stopPolling();
        this.twilioService.hangup();
        this.twilioService.destroy();
        this._isActive$.next(false);
        this._rollStats$.next(null);
        this.activeCampaignId = null;
        this.lastLeadId = null;
    }

    // ── Angular lifecycle ────────────────────────────────────────────────────

    ngOnDestroy(): void {
        this.cleanup();
        this.destroy$.next();
        this.destroy$.complete();
    }
}
