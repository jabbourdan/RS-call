import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CampaignOption, LeadManagementItem, RollStats } from '../lead-management.models';

/** Status → badge colour map */
const STATUS_BADGE: Record<string, string> = {
    'ממתין':        'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    'ענה':          'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    'לא ענה':       'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    'לא רלוונטי':   'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300',
    'עסקה נסגרה':   'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    'פולו אפ':      'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    'אל תתקשר':     'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const CALL_STATUS_I18N: Record<string, string> = {
    'no_answer':   'LEAD_MANAGEMENT.STATUS_NO_ANSWER',
    'completed':   'LEAD_MANAGEMENT.STATUS_ANSWERED',
    'failed':      'LEAD_MANAGEMENT.CALL_STATUS_FAILED',
};

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
    selector: 'app-lead-list',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    templateUrl: './lead-list.component.html',
    styleUrls: ['./lead-list.component.scss'],
})
export class LeadListComponent implements OnChanges {
    @Input() campaigns: CampaignOption[] = [];
    @Input() leads: LeadManagementItem[] = [];
    @Input() selectedCampaignId = '';
    @Input() selectedLeadId: string | null = null;
    @Input() isRollActive = false;
    @Input() rollStats: RollStats | null = null;
    @Input() rollError = '';

    @Output() campaignChanged = new EventEmitter<string>();
    @Output() leadSelected = new EventEmitter<LeadManagementItem>();
    @Output() autoDialerClicked = new EventEmitter<void>();

    currentTab: 'queue' | 'follow-ups' | 'search' = 'queue';
    searchQuery = '';

    filteredLeads: LeadManagementItem[] = [];
    overdueFollowUps: LeadManagementItem[] = [];

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['leads'] || changes['selectedCampaignId'] || changes['campaigns']) {
            this.applyFilters();
        }
    }

    onCampaignChange(): void {
        this.campaignChanged.emit(this.selectedCampaignId);
    }

    switchTab(tab: 'queue' | 'follow-ups' | 'search'): void {
        this.currentTab = tab;
        if (tab !== 'search') {
            this.searchQuery = '';
        }
        this.applyFilters();
    }

    onSearch(): void {
        this.applyFilters();
    }

    selectLead(lead: LeadManagementItem): void {
        this.leadSelected.emit(lead);
    }

    applyFilters(): void {
        let result = [...this.leads];

        if (this.currentTab === 'queue') {
            const now = new Date();
            const maxCalls = this.campaigns.find(c => c.campaign_id === this.selectedCampaignId)?.max_calls_to_unanswered_lead ?? Infinity;

            // Overdue follow-ups: פולו אפ leads whose scheduled time has passed
            this.overdueFollowUps = result
                .filter(l => l.status.current === 'פולו אפ' && l.follow_up_date && new Date(l.follow_up_date) < now)
                .sort((a, b) => new Date(a.follow_up_date!).getTime() - new Date(b.follow_up_date!).getTime());

            // Regular queue: pending + didn't-answer leads still under the per-campaign call cap
            result = result.filter(l =>
                (l.status.current === 'ממתין' || l.status.current === 'לא ענה') &&
                l.tried_to_reach < maxCalls
            );
            result.sort((a, b) => {
                if (!a.last_call_at && !b.last_call_at) return 0;
                if (!a.last_call_at) return -1;
                if (!b.last_call_at) return 1;
                return new Date(a.last_call_at).getTime() - new Date(b.last_call_at).getTime();
            });
        } else {
            this.overdueFollowUps = [];
        }

        if (this.currentTab === 'follow-ups') {
            // Follow-ups: only פולו אפ leads, sorted by follow_up_date ascending (soonest first)
            result = result.filter(l => l.status.current === 'פולו אפ');
            result.sort((a, b) => {
                if (!a.follow_up_date && !b.follow_up_date) return 0;
                if (!a.follow_up_date) return 1;
                if (!b.follow_up_date) return -1;
                return new Date(a.follow_up_date).getTime() - new Date(b.follow_up_date).getTime();
            });
        } else if (this.currentTab === 'search' && this.searchQuery.trim()) {
            const q = this.searchQuery.toLowerCase();
            result = result.filter(l =>
                (l.name && l.name.toLowerCase().includes(q)) ||
                (l.phone_number && l.phone_number.includes(q)) ||
                (l.email && l.email.toLowerCase().includes(q))
            );
        }

        this.filteredLeads = result;
    }

    isOverdue(follow_up_date: string | null): boolean {
        if (!follow_up_date) return false;
        return new Date(follow_up_date) < new Date();
    }

    getStatusBadge(status: string): string {
        return STATUS_BADGE[status] ?? 'bg-gray-100 text-gray-600';
    }

    getStatusI18n(status: string): string {
        return STATUS_I18N[status] ?? status;
    }

    getCallStatusI18n(status: string): string {
        return CALL_STATUS_I18N[status] ?? status;
    }

    formatDate(iso: string | null): string {
        if (!iso) return '';
        const d = new Date(iso);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yy = String(d.getFullYear()).slice(2);
        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        return `${dd}.${mm}.${yy}, ${hh}:${min}`;
    }

    trackByLead(_: number, lead: LeadManagementItem): string {
        return lead.lead_id;
    }
}
