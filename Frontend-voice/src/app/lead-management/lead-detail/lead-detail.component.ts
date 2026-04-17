import { Component, EventEmitter, Input, Output, OnChanges, OnInit, OnDestroy, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { KeypadKey, LeadManagementItem, PerformanceStats, Representative } from '../lead-management.models';
import { TwilioVoiceService } from '../twilio-voice.service';

const STATUS_I18N: Record<string, string> = {
    'ממתין':        'LEAD_MANAGEMENT.STATUS_PENDING',
    'ענה':          'LEAD_MANAGEMENT.STATUS_ANSWERED',
    'לא ענה':       'LEAD_MANAGEMENT.STATUS_NO_ANSWER',
    'לא רלוונטי':   'LEAD_MANAGEMENT.STATUS_NOT_RELEVANT',
    'עסקה נסגרה':   'LEAD_MANAGEMENT.STATUS_CLOSED_DEAL',
    'פולו אפ':      'LEAD_MANAGEMENT.STATUS_FOLLOW_UP',
    'אל תתקשר':     'LEAD_MANAGEMENT.STATUS_DO_NOT_CALL',
};

@Component({
    selector: 'app-lead-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    templateUrl: './lead-detail.component.html',
    styleUrls: ['./lead-detail.component.scss'],
})
export class LeadDetailComponent implements OnChanges, OnInit, OnDestroy {
    @Input() lead: LeadManagementItem | null = null;
    @Input() representatives: Representative[] = [];
    @Input() performance: PerformanceStats | null = null;
    @Input() isRollActive = false;
    @Input() activeCallId: string | null = null;
    @Input() statusGateActive = false;

    @Output() statusChanged = new EventEmitter<{ leadId: string; status: string; followUpDate?: string; representativeId?: string; comment?: string }>();
    @Output() callInitiated = new EventEmitter<string>(); // lead_id
    @Output() callEnded = new EventEmitter<string | null>(); // call_id

    private twilioService = inject(TwilioVoiceService);

    currentTab: 'actions' | 'performance' = 'actions';

    // Call controls state
    isCallActive = false;
    isMuted = false;
    isPaused = false;
    showKeypad = false;
    keypadKeys: KeypadKey[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

    // Form state
    selectedStatus = '';
    followUpDate = '';
    followUpTime = '';
    selectedRepresentativeId = '';
    commentText = '';

    // Save state
    isSaving = false;
    hasUnsavedChanges = false;

    // Snapshot of initial values for dirty tracking
    private _initialStatus = '';
    private _initialFollowUpDate = '';
    private _initialFollowUpTime = '';
    private _initialRepresentativeId = '';

    // Twilio subscription
    private incomingSub: Subscription | null = null;

    ngOnInit(): void {
        // Subscribe to Twilio incoming call state.
        // When the call disconnects (incoming$ emits null), auto-reset call UI.
        this.incomingSub = this.twilioService.incoming$.subscribe(call => {
            if (!call && this.isCallActive) {
                // The call was disconnected (either by remote party or backend)
                this.isCallActive = false;
                this.isMuted = false;
                this.isPaused = false;
                this.showKeypad = false;
            }
        });
    }

    ngOnDestroy(): void {
        this.incomingSub?.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['lead'] && this.lead) {
            this.selectedStatus = this.lead.status.current;
            this.followUpDate = this.lead.follow_up_date
                ? new Date(this.lead.follow_up_date).toISOString().slice(0, 10)
                : '';
            this.followUpTime = this.lead.follow_up_date
                ? new Date(this.lead.follow_up_date).toTimeString().slice(0, 5)
                : '';
            // Default to "me"
            const me = this.representatives.find(r => r.is_me);
            this.selectedRepresentativeId = me ? me.user_id : '';
            this.commentText = '';
            this.isCallActive = false;
            this.isMuted = false;
            this.isPaused = false;
            this.showKeypad = false;
            this.hasUnsavedChanges = false;
            this.isSaving = false;

            // Store initial snapshot for dirty tracking
            this._initialStatus = this.selectedStatus;
            this._initialFollowUpDate = this.followUpDate;
            this._initialFollowUpTime = this.followUpTime;
            this._initialRepresentativeId = this.selectedRepresentativeId;
        }
    }

    switchTab(tab: 'actions' | 'performance'): void {
        this.currentTab = tab;
    }

    // ── Call controls ────────────────────────────────────────────────────────

    startCall(): void {
        if (this.lead) {
            this.isCallActive = true;
            this.callInitiated.emit(this.lead.lead_id);
        }
    }

    hangUp(): void {
        // Disconnect the browser-side WebRTC call
        this.twilioService.hangup();
        // Tell the parent to terminate the call on the backend too
        this.callEnded.emit(this.activeCallId);
        this.isCallActive = false;
        this.isMuted = false;
        this.isPaused = false;
        this.showKeypad = false;
    }

    toggleMute(): void {
        this.isMuted = !this.isMuted;
        this.twilioService.setMute(this.isMuted);
    }

    togglePause(): void {
        this.isPaused = !this.isPaused;
    }

    toggleKeypad(): void {
        this.showKeypad = !this.showKeypad;
    }

    pressKey(key: KeypadKey): void {
        this.twilioService.sendDigits(key);
    }

    // ── Status ───────────────────────────────────────────────────────────────

    markDirty(): void {
        this.hasUnsavedChanges =
            this.selectedStatus !== this._initialStatus ||
            this.followUpDate !== this._initialFollowUpDate ||
            this.followUpTime !== this._initialFollowUpTime ||
            this.selectedRepresentativeId !== this._initialRepresentativeId ||
            this.commentText.trim().length > 0;
    }

    saveSettings(): void {
        if (!this.lead || this.isSaving) return;
        this.isSaving = true;

        const payload: { leadId: string; status: string; followUpDate?: string; representativeId?: string; comment?: string } = {
            leadId: this.lead.lead_id,
            status: this.selectedStatus,
        };
        if (this.selectedStatus === 'פולו אפ' && this.followUpDate) {
            payload.followUpDate = `${this.followUpDate}T${this.followUpTime || '00:00'}:00`;
        }
        if (this.selectedRepresentativeId) {
            payload.representativeId = this.selectedRepresentativeId;
        }
        if (this.commentText.trim()) {
            payload.comment = this.commentText.trim();
        }
        this.statusChanged.emit(payload);

        // Update snapshot after save
        this._initialStatus = this.selectedStatus;
        this._initialFollowUpDate = this.followUpDate;
        this._initialFollowUpTime = this.followUpTime;
        this._initialRepresentativeId = this.selectedRepresentativeId;
        this.commentText = '';
        this.hasUnsavedChanges = false;
        this.isSaving = false;
    }

    getStatusI18n(status: string): string {
        return STATUS_I18N[status] ?? status;
    }

    get isFollowUp(): boolean {
        return this.selectedStatus === 'פולו אפ';
    }

    // ── Performance helpers ──────────────────────────────────────────────────

    formatMinutes(seconds: number): string {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    }
}
