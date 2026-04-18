import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { LeadListComponent } from './lead-list/lead-list.component';
import { LeadTimelineComponent } from './lead-timeline/lead-timeline.component';
import { LeadDetailComponent } from './lead-detail/lead-detail.component';

import {
    CampaignOption,
    CallStatusInfo,
    LeadManagementItem,
    PerformanceStats,
    Representative,
    RollStats,
    TimelineEvent,
    mapApiEventsToUi,
} from './lead-management.models';

import { LeadManagementService } from '../services/lead-management/lead-management.service';
import { LeadService } from '../services/leads/lead.service';
import { CampaignService } from '../services/campaigns/campaign.service';
import { RollService } from './roll.service';
import { TwilioVoiceService } from './twilio-voice.service';
import { OrgUser } from '../services/lead-management/lead-management-api.models';

// Stored user_id after login (set by auth service / interceptor)
function getStoredUserId(): string {
    return localStorage.getItem('user_id') ?? '';
}

@Component({
    selector: 'app-lead-management',
    standalone: true,
    imports: [
        CommonModule,
        TranslateModule,
        LeadListComponent,
        LeadTimelineComponent,
        LeadDetailComponent,
    ],
    templateUrl: './lead-management.component.html',
    styleUrls: ['./lead-management.component.scss'],
})
export class LeadManagementComponent implements OnInit, OnDestroy {

    // ── Data ─────────────────────────────────────────────────────────────────
    campaigns: CampaignOption[] = [];
    allLeads: LeadManagementItem[] = [];
    filteredLeads: LeadManagementItem[] = [];
    representatives: Representative[] = [];
    performance: PerformanceStats | null = null;

    // ── Selection state ──────────────────────────────────────────────────────
    selectedCampaignId = '';
    selectedLead: LeadManagementItem | null = null;
    timelineEvents: TimelineEvent[] = [];
    callStatus: CallStatusInfo | null = null;
    activeCallId: string | null = null;

    // ── Loading / error ──────────────────────────────────────────────────────
    isLoadingLeads   = false;
    isLoadingTimeline = false;
    isSubmittingComment = false;
    isSubmittingStatus  = false;
    leadsError    = '';
    timelineError = '';

    // ── Mobile drawer ──────────────────────────────────────────────────────
    showMobileDrawer = false;

    // ── Roll state ─────────────────────────────────────────────────────────
    isRollActive = false;
    rollStats: RollStats | null = null;
    rollError = '';

    // ── Status gate (server-driven via roll_paused) ──────────────────────────
    statusGateActive = false;
    rollProceedError = '';

    private readonly destroy$ = new Subject<void>();

    constructor(
        private lmService: LeadManagementService,
        private leadService: LeadService,
        private campaignService: CampaignService,
        public rollService: RollService,
        public twilioService: TwilioVoiceService,
    ) {}

    ngOnInit(): void {
        this.loadInitialData();
        this.subscribeToRoll();
    }

    ngOnDestroy(): void {
        this.rollService.cleanup();
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ── Roll subscriptions ────────────────────────────────────────────────

    private subscribeToRoll(): void {
        this.rollService.isActive$
            .pipe(takeUntil(this.destroy$))
            .subscribe(active => {
                this.isRollActive = active;
                if (!active) {
                    this.statusGateActive = false;
                    this.rollProceedError = '';
                }
            });

        this.rollService.isPaused$
            .pipe(takeUntil(this.destroy$))
            .subscribe(paused => {
                this.statusGateActive = paused;
                if (!paused) {
                    this.rollProceedError = '';
                }
            });

        this.rollService.rollStats$
            .pipe(takeUntil(this.destroy$))
            .subscribe(stats => this.rollStats = stats);

        this.rollService.error$
            .pipe(takeUntil(this.destroy$))
            .subscribe(err => this.rollError = err);

        // Auto-select the paused lead so the agent can update its status
        this.rollService.currentLeadChanged$
            .pipe(takeUntil(this.destroy$))
            .subscribe(leadId => {
                const lead = this.allLeads.find(l => l.lead_id === leadId);
                if (lead) {
                    this.onLeadSelected(lead);
                }
            });
    }

    // ── Auto Dialer toggle ────────────────────────────────────────────────

    onAutoDialerClicked(): void {
        if (!this.selectedCampaignId) return;

        if (this.isRollActive) {
            this.rollService.stopRoll(this.selectedCampaignId);
        } else {
            this.rollService.startRoll(this.selectedCampaignId);
        }
    }

    // ── Bootstrap ────────────────────────────────────────────────────────────

    private loadInitialData(): void {
        // Load campaigns list + org users in parallel
        forkJoin({
            campaigns: this.campaignService.list(),
            users: this.lmService.getOrgUsers(),
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
            next: ({ campaigns, users }) => {
                this.campaigns = campaigns
                    .filter(c => c.status === 'active')
                    .map(c => ({
                        campaign_id: c.campaign_id,
                        name: c.name,
                        max_calls_to_unanswered_lead: c.settings?.max_calls_to_unanswered_lead ?? 3,
                    }));
                this.representatives = this.mapUsersToRepresentatives(users);

                if (this.campaigns.length > 0) {
                    this.selectedCampaignId = this.campaigns[0].campaign_id;
                    this.loadLeads(this.selectedCampaignId);
                    this.loadPerformance(this.selectedCampaignId);
                    this.rollService.syncState(this.selectedCampaignId);
                }
            },
            error: () => {
                this.leadsError = 'Failed to load campaigns.';
            },
        });
    }

    private loadLeads(campaignId: string): void {
        this.isLoadingLeads = true;
        this.leadsError = '';
        this.leadService.listLeads(campaignId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (leads) => {
                    const campaignName = this.campaigns.find(c => c.campaign_id === campaignId)?.name ?? '';
                    this.allLeads = leads.map(l => this.mapLeadToItem(l, campaignId, campaignName));
                    this.filterLeadsByCampaign();
                    this.isLoadingLeads = false;
                },
                error: () => {
                    this.leadsError = 'Failed to load leads.';
                    this.isLoadingLeads = false;
                },
            });
    }

    private loadPerformance(campaignId: string): void {
        this.lmService.getCampaignStats(campaignId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (stats) => {
                    this.performance = {
                        todays_follow_up_calls:     stats.follow_up,
                        closed_deals:               stats.closed_deals,
                        calls_with_new_customers:   stats.answered,
                        total_managed_calls:        stats.total_leads,
                        total_time_in_calls:        0, // no endpoint yet
                    };
                },
                error: () => {
                    // Non-critical — leave performance null
                },
            });
    }

    private loadTimeline(leadId: string): void {
        this.isLoadingTimeline = true;
        this.timelineError = '';
        this.lmService.getFullTimeline(leadId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    // Backend returns newest-first; reverse so oldest appears at top
                    this.timelineEvents = mapApiEventsToUi([...res.events].reverse());
                    // Sync lead summary back into the selected lead
                    if (this.selectedLead) {
                        const s = res.lead_summary;
                        this.selectedLead = {
                            ...this.selectedLead,
                            name:           s.name ?? this.selectedLead.name,
                            phone_number:   s.phone_number ?? this.selectedLead.phone_number,
                            status: {
                                ...this.selectedLead.status,
                                current: s.current_status,
                            },
                            follow_up_date: s.follow_up_date,
                            creation_note:  s.created_by ?? null,
                            extra_data:     s.extra_data,
                        };
                    }
                    // Build callStatus from lead_summary
                    const summary = res.lead_summary;
                    this.callStatus = {
                        status_label:   summary.current_status,
                        follow_up_date: summary.follow_up_date
                            ? new Date(summary.follow_up_date).toLocaleDateString()
                            : null,
                        follow_up_time: summary.follow_up_date
                            ? new Date(summary.follow_up_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : null,
                    };
                    this.isLoadingTimeline = false;
                },
                error: () => {
                    this.timelineError = 'Failed to load timeline.';
                    this.isLoadingTimeline = false;
                },
            });
    }

    // ── Campaign change ──────────────────────────────────────────────────────

    onCampaignChanged(campaignId: string): void {
        // If roll is active on old campaign, stop it first
        if (this.isRollActive) {
            this.rollService.cleanup();
        }
        // Clear any leftover roll error from previous campaign
        this.rollService.clearError();
        this.selectedCampaignId = campaignId;
        this.selectedLead = null;
        this.timelineEvents = [];
        this.callStatus = null;
        this.statusGateActive = false;
        this.rollProceedError = '';
        this.loadLeads(campaignId);
        this.loadPerformance(campaignId);
        this.rollService.syncState(campaignId);
    }

    // ── Lead selection ───────────────────────────────────────────────────────

    onLeadSelected(lead: LeadManagementItem): void {
        this.selectedLead = lead;
        this.showMobileDrawer = false;
        this.loadTimeline(lead.lead_id);
    }

    // ── Comment added ────────────────────────────────────────────────────────

    onCommentAdded(text: string): void {
        if (!this.selectedLead) return;
        this.isSubmittingComment = true;
        this.lmService.addComment(this.selectedLead.lead_id, text)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    const newEvent: TimelineEvent = {
                        id: res.comment_id,
                        type: 'comment',
                        timestamp: res.created_at,
                        agent_name: res.agent_name,
                        comment_text: res.content,
                    };
                    this.timelineEvents = [...this.timelineEvents, newEvent];
                    this.isSubmittingComment = false;
                },
                error: () => {
                    this.isSubmittingComment = false;
                },
            });
    }

    // ── Status change ────────────────────────────────────────────────────────

    onStatusChanged(payload: { leadId: string; status: string; followUpDate?: string }): void {
        if (!this.selectedLead) return;
        this.isSubmittingStatus = true;
        const oldStatus = this.selectedLead.status.current;

        const body = {
            status: payload.status,
            follow_up_date: payload.followUpDate ?? null,
        };

        this.lmService.updateStatus(this.selectedLead.campaign_id, payload.leadId, body)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    // Update the lead in memory
                    if (this.selectedLead) {
                        this.selectedLead = {
                            ...this.selectedLead,
                            status: { ...this.selectedLead.status, current: res.new_status },
                            follow_up_date: res.follow_up_date,
                        };
                    }
                    // Sync in allLeads list
                    const idx = this.allLeads.findIndex(l => l.lead_id === payload.leadId);
                    if (idx !== -1) {
                        this.allLeads[idx] = { ...this.allLeads[idx], status: { ...this.allLeads[idx].status, current: res.new_status }, follow_up_date: res.follow_up_date };
                        this.allLeads = [...this.allLeads];
                        this.filterLeadsByCampaign();
                    }
                    // Prepend event to timeline
                    const events: TimelineEvent[] = [{
                        id: `ev-${Date.now()}`,
                        type: 'status_change',
                        timestamp: res.updated_at,
                        agent_name: this.representatives.find(r => r.is_me)?.name ?? null,
                        old_status: oldStatus,
                        new_status: res.new_status,
                    }];
                    if (res.follow_up_date) {
                        events.push({
                            id: `ev-${Date.now()}-fu`,
                            type: 'follow_up_scheduled',
                            timestamp: res.updated_at,
                            agent_name: this.representatives.find(r => r.is_me)?.name ?? null,
                            follow_up_date: res.follow_up_date,
                        });
                    }
                    this.timelineEvents = [...this.timelineEvents, ...events];
                    this.isSubmittingStatus = false;

                    // Proceed to next lead after status is confirmed
                    if (this.statusGateActive) {
                        this.onProceedRoll();
                    }
                },
                error: () => {
                    this.isSubmittingStatus = false;
                },
            });
    }

    // ── Status gate actions ───────────────────────────────────────────────────

    onProceedRoll(): void {
        if (!this.selectedCampaignId) return;
        this.rollProceedError = '';
        this.lmService.proceedRoll(this.selectedCampaignId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                error: () => {
                    this.rollProceedError = 'ROLL.PROCEED_ERROR';
                },
            });
    }

    onKeepAndContinue(): void {
        if (!this.statusGateActive) return;
        this.onProceedRoll();
    }

    @HostListener('document:keydown.enter')
    onEnterKey(): void {
        if (this.statusGateActive) {
            this.onKeepAndContinue();
        }
    }

    // ── Call initiated ───────────────────────────────────────────────────────

    async onCallInitiated(leadId: string): Promise<void> {
        if (!this.selectedLead) return;
        const campaignId = this.selectedLead.campaign_id;

        // Ensure Twilio device is initialized so the backend can bridge the call to us
        try {
            await this.twilioService.initialize();
        } catch (err) {
            console.error('[LeadManagement] Failed to initialize Twilio device for manual call', err);
            return;
        }

        this.lmService.startCall(leadId, campaignId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    // Store the call_id so we can hang up through the backend later
                    this.activeCallId = res.call_id;

                    // Optimistically add outgoing call event
                    const event: TimelineEvent = {
                        id: res.call_id,
                        type: 'outgoing_call',
                        timestamp: new Date().toISOString(),
                        agent_name: this.representatives.find(r => r.is_me)?.name ?? null,
                        phone_number: res.to,
                        direction: 'outbound',
                        is_auto_dialer: false,
                    };
                    this.timelineEvents = [...this.timelineEvents, event];
                },
            });
    }

    // ── Call ended (hangup from agent) ────────────────────────────────────────

    onCallEnded(callId: string | null): void {
        if (callId) {
            // Tell the backend to terminate the conference/call
            this.lmService.hangupCall(callId)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        console.log('[LeadManagement] Call terminated on backend:', callId);
                    },
                    error: (err) => {
                        console.error('[LeadManagement] Failed to hangup on backend:', err);
                    },
                });
        }
        this.activeCallId = null;
    }

    // ── Mobile ───────────────────────────────────────────────────────────────

    toggleMobileDrawer(): void {
        this.showMobileDrawer = !this.showMobileDrawer;
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private filterLeadsByCampaign(): void {
        this.filteredLeads = this.allLeads.filter(l => l.campaign_id === this.selectedCampaignId);
    }

    private mapLeadToItem(lead: import('../services/leads/lead.models').Lead, campaignId: string, campaignName: string): LeadManagementItem {
        return {
            lead_id:            lead.lead_id,
            campaign_id:        campaignId,
            campaign_name:      campaignName,
            phone_number:       lead.phone_number ?? '',
            name:               lead.name ?? '',
            email:              lead.email,
            status:             lead.status,
            follow_up_date:     lead.follow_up_date,
            creation_note:      null,   // populated from timeline full response
            tried_to_reach:     lead.tried_to_reach,
            sum_calls_performed: lead.sum_calls_performed,
            last_call_at:       lead.last_call_at,
            created_at:         lead.created_at,
            extra_data:         lead.extra_data,
        };
    }

    private mapUsersToRepresentatives(users: OrgUser[]): Representative[] {
        const myId = getStoredUserId();
        return users.map(u => ({
            user_id: u.user_id,
            name:    u.full_name,
            is_me:   u.user_id === myId,
        }));
    }
}
