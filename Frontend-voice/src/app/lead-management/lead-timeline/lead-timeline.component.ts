import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CampaignOption, CallStatusInfo, LeadManagementItem, TimelineEvent } from '../lead-management.models';
import { LeadService } from '../../services/leads/lead.service';
import { LeadBriefing } from '../../services/leads/lead.models';

@Component({
    selector: 'app-lead-timeline',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    templateUrl: './lead-timeline.component.html',
    styleUrls: ['./lead-timeline.component.scss'],
})
export class LeadTimelineComponent implements OnChanges {
    @Input() lead: LeadManagementItem | null = null;
    @Input() events: TimelineEvent[] = [];
    @Input() callStatus: CallStatusInfo | null = null;
    @Input() campaigns: CampaignOption[] = [];
    @Input() selectedCampaignId = '';

    @Output() campaignChanged = new EventEmitter<string>();
    @Output() commentAdded = new EventEmitter<string>();

    newComment = '';
    creationNoteExpanded = false;

    // ─── Lead Briefing state ─────────────────────────────────────────────────
    briefing: LeadBriefing | null = null;
    isBriefingLoading = false;        // initial GET in flight
    isBriefingGenerating = false;     // POST in flight (create or regenerate)
    briefingError: string | null = null;
    isBriefingCollapsed = false;      // agent can collapse the card to free up timeline space
    private loadedBriefingForLeadId: string | null = null;

    toggleBriefingCollapsed(): void {
        this.isBriefingCollapsed = !this.isBriefingCollapsed;
    }

    /** Ordered (key, label, value) entries from lead.extra_data for compact display.
     *  Skips empty / null values and stringifies non-primitives. */
    get basicExtraDataEntries(): Array<{ key: string; value: string }> {
        const data = this.lead?.extra_data;
        if (!data) return [];
        const out: Array<{ key: string; value: string }> = [];
        for (const [key, raw] of Object.entries(data)) {
            if (raw === null || raw === undefined || raw === '') continue;
            const value = typeof raw === 'object' ? JSON.stringify(raw) : String(raw);
            out.push({ key, value });
        }
        return out;
    }

    private readonly leadService = inject(LeadService);

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['lead']) {
            this.refreshBriefingForCurrentLead();
        }
    }

    onCampaignChange(): void {
        this.campaignChanged.emit(this.selectedCampaignId);
    }

    // ─── Briefing actions ────────────────────────────────────────────────────

    private refreshBriefingForCurrentLead(): void {
        const leadId = this.lead?.lead_id ?? null;
        if (leadId === this.loadedBriefingForLeadId) {
            return;
        }
        this.loadedBriefingForLeadId = leadId;
        this.briefing = null;
        this.briefingError = null;
        this.isBriefingGenerating = false;
        if (!leadId) {
            return;
        }
        this.isBriefingLoading = true;
        this.leadService.getLeadBriefing(leadId).subscribe({
            next: (b) => {
                if (this.loadedBriefingForLeadId === leadId) {
                    this.briefing = b;
                    this.isBriefingLoading = false;
                }
            },
            error: () => {
                if (this.loadedBriefingForLeadId === leadId) {
                    this.isBriefingLoading = false;
                    // Treat initial GET errors (non-404) the same as "no briefing yet".
                    this.briefing = null;
                }
            },
        });
    }

    onCreateBriefing(): void {
        const leadId = this.lead?.lead_id;
        if (!leadId || this.isBriefingGenerating) {
            return;
        }
        this.isBriefingGenerating = true;
        this.briefingError = null;
        this.leadService.createOrRegenerateLeadBriefing(leadId).subscribe({
            next: (b) => {
                this.briefing = b;
                this.isBriefingGenerating = false;
            },
            error: () => {
                this.isBriefingGenerating = false;
                this.briefingError = 'LEAD_MANAGEMENT.BRIEFING.ERROR_TEXT';
            },
        });
    }

    onRegenerateBriefing(): void {
        const leadId = this.lead?.lead_id;
        if (!leadId || this.isBriefingGenerating) {
            return;
        }
        this.isBriefingGenerating = true;
        this.briefingError = null;
        this.leadService.createOrRegenerateLeadBriefing(leadId).subscribe({
            next: (b) => {
                this.briefing = b;
                this.isBriefingGenerating = false;
            },
            error: () => {
                this.isBriefingGenerating = false;
                // Keep the previously-shown briefing visible on regen failure.
                this.briefingError = 'LEAD_MANAGEMENT.BRIEFING.REGENERATE_ERROR';
            },
        });
    }

    submitComment(): void {
        const text = this.newComment.trim();
        if (text) {
            this.commentAdded.emit(text);
            this.newComment = '';
        }
    }

    toggleCreationNote(): void {
        this.creationNoteExpanded = !this.creationNoteExpanded;
    }

    formatDateTime(iso: string): string {
        const d = new Date(iso);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yy = String(d.getFullYear()).slice(2);
        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        return `${dd}.${mm}.${yy}\n${hh}:${min}`;
    }

    formatDateOnly(iso: string): string {
        const d = new Date(iso);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yy = String(d.getFullYear()).slice(2);
        return `${dd}.${mm}.${yy}`;
    }

    formatTimeOnly(iso: string): string {
        const d = new Date(iso);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }

    formatDuration(seconds: number | null | undefined): string {
        if (!seconds) return '00:00';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    getEventIcon(type: string): string {
        switch (type) {
            case 'follow_up_scheduled': return 'schedule';
            case 'outgoing_call':       return 'call_made';
            case 'incoming_call':       return 'call_received';
            case 'call_ended':          return 'schedule';
            case 'ai_summary':          return 'auto_awesome';
            case 'comment':             return 'chat_bubble';
            case 'status_change':       return 'swap_horiz';
            case 'lead_created':        return 'person_add';
            default:                    return 'info';
        }
    }

    getEventColor(type: string): string {
        switch (type) {
            case 'follow_up_scheduled': return 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300';
            case 'outgoing_call':       return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300';
            case 'incoming_call':       return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300';
            case 'call_ended':          return 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300';
            case 'ai_summary':          return 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300';
            case 'comment':             return 'bg-blue-100 text-blue-500 dark:bg-blue-900 dark:text-blue-300';
            case 'status_change':       return 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300';
            case 'lead_created':        return 'bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-300';
            default:                    return 'bg-gray-100 text-gray-500';
        }
    }

    getEventI18nKey(type: string): string {
        switch (type) {
            case 'follow_up_scheduled': return 'LEAD_MANAGEMENT.EVENT_FOLLOW_UP';
            case 'outgoing_call':       return 'LEAD_MANAGEMENT.EVENT_OUTGOING_CALL';
            case 'incoming_call':       return 'LEAD_MANAGEMENT.EVENT_INCOMING_CALL';
            case 'call_ended':          return 'LEAD_MANAGEMENT.EVENT_CALL_ENDED';
            case 'ai_summary':          return 'LEAD_MANAGEMENT.EVENT_AI_SUMMARY';
            case 'comment':             return 'LEAD_MANAGEMENT.EVENT_COMMENT';
            case 'status_change':       return 'LEAD_MANAGEMENT.EVENT_STATUS_CHANGE';
            case 'lead_created':        return 'LEAD_MANAGEMENT.EVENT_LEAD_CREATED';
            default:                    return '';
        }
    }

    trackByEvent(_: number, ev: TimelineEvent): string {
        return ev.id;
    }

    isStructured(event: TimelineEvent): boolean {
        return event.type === 'ai_summary' && event.summary_status === 'available' && !!event.summary_sections;
    }

    isGenerating(event: TimelineEvent): boolean {
        return event.type === 'ai_summary' && event.summary_status === 'generating';
    }

    isFailed(event: TimelineEvent): boolean {
        return event.type === 'ai_summary' && event.summary_status === 'failed';
    }

    isLegacy(event: TimelineEvent): boolean {
        return event.type === 'ai_summary' && (
            !event.summary_status || event.summary_status === 'unstructured_legacy'
        );
    }

    getStatusI18n(status: string | null | undefined): string {
        if (!status) return '';

        const STATUS_I18N: Record<string, string> = {
            'ממתין':      'LEAD_MANAGEMENT.STATUS_PENDING',
            'ענה':        'LEAD_MANAGEMENT.STATUS_ANSWERED',
            'לא ענה':     'LEAD_MANAGEMENT.STATUS_NO_ANSWER',
            'לא רלוונטי': 'LEAD_MANAGEMENT.STATUS_NOT_RELEVANT',
            'עסקה נסגרה': 'LEAD_MANAGEMENT.STATUS_CLOSED_DEAL',
            'פולו אפ':    'LEAD_MANAGEMENT.STATUS_FOLLOW_UP',
            'אל תתקשר':   'LEAD_MANAGEMENT.STATUS_DO_NOT_CALL',
        };
        return STATUS_I18N[status] ?? status;
    }
}
