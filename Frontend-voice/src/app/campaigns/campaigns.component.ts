import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { CampaignService } from '../services/campaigns/campaign.service';
import {
    CampaignOverview,
    CampaignStatus,
    CallingAlgorithm,
    CreateCampaignRequest,
    UpdateCampaignRequest,
    UpdateCampaignSettingsRequest,
} from '../services/campaigns/campaign.models';
import { OrgPhoneNumberService } from '../services/org-phone-numbers/org-phone-number.service';
import { OrgPhoneNumber } from '../services/org-phone-numbers/org-phone-number.models';

// ─── Status badge colours ─────────────────────────────────────────────────────

export const CAMPAIGN_STATUS_BADGE: Record<CampaignStatus, string> = {
    draft:     'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    active:    'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    paused:    'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
};

export const CAMPAIGN_STATUS_I18N: Record<CampaignStatus, string> = {
    draft:     'CAMPAIGNS.STATUS_DRAFT',
    active:    'CAMPAIGNS.STATUS_ACTIVE',
    paused:    'CAMPAIGNS.STATUS_PAUSED',
    completed: 'CAMPAIGNS.STATUS_COMPLETED',
};

// ─── Default Hebrew statuses ──────────────────────────────────────────────────

const DEFAULT_STATUSES = ['ממתין', 'ענה', 'לא רלוונטי', 'עסקה נסגרה', 'פולו אפ', 'אל תתקשר'];

// ─── Form shape ───────────────────────────────────────────────────────────────

interface CampaignFormData {
    name: string;
    description: string;
    status: CampaignStatus;
    primary_phone_id: string;
    secondary_phone_id: string;
    change_number_after: string;
    max_calls_to_unanswered_lead: string;
    calling_algorithm: CallingAlgorithm;
    cooldown_minutes: string;
    statusesRaw: string;   // comma-separated for textarea
}

@Component({
    selector: 'app-campaigns',
    standalone: true,
    imports: [RouterLink, CommonModule, FormsModule, TranslateModule],
    templateUrl: './campaigns.component.html',
    styleUrl: './campaigns.component.scss'
})
export class CampaignsComponent implements OnInit {

    // ─── Page state ──────────────────────────────────────────────────────────────

    campaigns: CampaignOverview[] = [];

    isLoading = false;
    successMessage = '';
    errorMessage = '';

    // ─── Status helpers (exposed to template) ────────────────────────────────────

    readonly statusBadge = CAMPAIGN_STATUS_BADGE;
    readonly statusI18n  = CAMPAIGN_STATUS_I18N;
    readonly statusOptions: CampaignStatus[] = ['draft', 'active', 'paused', 'completed'];
    readonly algorithmOptions: CallingAlgorithm[] = ['priority', 'random', 'sequential'];

    // ─── Form dialog ─────────────────────────────────────────────────────────────

    showFormDialog  = false;
    isEditMode      = false;
    editingId: string | null = null;

    formData: CampaignFormData = this.blankForm();
    formErrors: { name?: string } = {};
    formSubmitting  = false;
    showSettings    = false;

    // ─── Delete dialog ────────────────────────────────────────────────────────────

    showDeleteConfirm = false;
    deletingId: string | null = null;
    deletingName    = '';
    deleteSubmitting = false;

    // ─── Org phone numbers (for campaign settings dropdowns) ───────────────────

    orgPhoneNumbers: OrgPhoneNumber[] = [];

    constructor(
        private campaignService: CampaignService,
        private phoneNumberService: OrgPhoneNumberService,
        private translate: TranslateService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadCampaigns();
        this.loadOrgPhoneNumbers();
    }

    // ─── Load ─────────────────────────────────────────────────────────────────────

    loadCampaigns(): void {
        this.isLoading = true;
        this.errorMessage = '';
        this.campaignService.allOverviews().subscribe({
            next: (campaigns) => {
                this.campaigns = campaigns;
                this.isLoading = false;
            },
            error: (err) => {
                this.errorMessage = this.extractError(err);
                this.isLoading = false;
            }
        });
    }

    loadOrgPhoneNumbers(): void {
        this.phoneNumberService.list().subscribe({
            next: (numbers) => { this.orgPhoneNumbers = numbers; },
            error: () => { this.orgPhoneNumbers = []; }
        });
    }

    // ─── Navigation ──────────────────────────────────────────────────────────────

    viewLeads(campaignId: string): void {
        this.router.navigate(['/dashboard/leads'], { queryParams: { campaign: campaignId } });
    }

    importLeads(campaignId: string): void {
        this.router.navigate(['/dashboard/leads'], { queryParams: { campaign: campaignId, import: 'true' } });
    }

    // ─── Form dialog helpers ──────────────────────────────────────────────────────

    private blankForm(): CampaignFormData {
        return {
            name: '',
            description: '',
            status: 'draft',
            primary_phone_id: '',
            secondary_phone_id: '',
            change_number_after: '',
            max_calls_to_unanswered_lead: '3',
            calling_algorithm: 'priority',
            cooldown_minutes: '120',
            statusesRaw: DEFAULT_STATUSES.join(', '),
        };
    }

    openAddDialog(): void {
        this.isEditMode     = false;
        this.editingId      = null;
        this.formData       = this.blankForm();
        this.formErrors     = {};
        this.showSettings   = false;
        this.successMessage = '';
        this.showFormDialog = true;
    }

    openEditDialog(campaign: CampaignOverview): void {
        this.isEditMode   = true;
        this.editingId    = campaign.campaign_id;
        this.showSettings = false;
        this.formErrors   = {};
        this.successMessage = '';

        const s = campaign.settings;
        this.formData = {
            name:                         campaign.name,
            description:                  campaign.description ?? '',
            status:                       campaign.status,
            primary_phone_id:             s.primary_phone_id ?? '',
            secondary_phone_id:           s.secondary_phone_id ?? '',
            change_number_after:          s.change_number_after != null ? String(s.change_number_after) : '',
            max_calls_to_unanswered_lead: String(s.max_calls_to_unanswered_lead),
            calling_algorithm:            s.calling_algorithm,
            cooldown_minutes:             String(s.cooldown_minutes),
            statusesRaw:                  (s.campaign_status?.statuses ?? DEFAULT_STATUSES).join(', '),
        };
        this.showFormDialog = true;
    }

    closeFormDialog(): void {
        this.showFormDialog = false;
        this.formErrors     = {};
    }

    validateForm(): boolean {
        this.formErrors = {};
        if (!this.formData.name.trim()) {
            this.formErrors.name = this.translate.instant('CAMPAIGNS.ERROR_NAME_REQUIRED');
        }
        return Object.keys(this.formErrors).length === 0;
    }

    submitForm(): void {
        if (!this.validateForm()) { return; }
        this.formSubmitting = true;
        this.successMessage = '';
        this.errorMessage   = '';

        const statuses = this.formData.statusesRaw
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        const settingsPayload: UpdateCampaignSettingsRequest = {
            primary_phone_id:             this.formData.primary_phone_id || null,
            secondary_phone_id:           this.formData.secondary_phone_id || null,
            change_number_after:          this.formData.change_number_after !== '' ? Number(this.formData.change_number_after) : null,
            max_calls_to_unanswered_lead: Number(this.formData.max_calls_to_unanswered_lead) || 3,
            calling_algorithm:            this.formData.calling_algorithm,
            cooldown_minutes:             Number(this.formData.cooldown_minutes) || 120,
            campaign_status:              { statuses: statuses.length > 0 ? statuses : DEFAULT_STATUSES },
        };

        if (this.isEditMode && this.editingId) {
            const campaignPayload: UpdateCampaignRequest = {
                name:        this.formData.name.trim(),
                description: this.formData.description.trim() || undefined,
                status:      this.formData.status,
            };
            this.campaignService.update(this.editingId, campaignPayload).subscribe({
                next: (updated) => {
                    this.campaignService.updateSettings(this.editingId!, settingsPayload).subscribe({
                        next: () => {
                            this.successMessage = this.translate.instant('CAMPAIGNS.SUCCESS_UPDATED');
                            this.formSubmitting  = false;
                            this.showFormDialog  = false;
                            this.loadCampaigns();
                        },
                        error: (err) => {
                            this.errorMessage   = this.extractError(err);
                            this.formSubmitting = false;
                        }
                    });
                },
                error: (err) => {
                    this.errorMessage   = this.extractError(err);
                    this.formSubmitting = false;
                }
            });
        } else {
            const createPayload: CreateCampaignRequest = {
                name:        this.formData.name.trim(),
                description: this.formData.description.trim() || undefined,
            };
            this.campaignService.create(createPayload).subscribe({
                next: (created) => {
                    this.campaignService.updateSettings(created.campaign_id, settingsPayload).subscribe({
                        next: () => {
                            this.successMessage = this.translate.instant('CAMPAIGNS.SUCCESS_CREATED');
                            this.formSubmitting  = false;
                            this.showFormDialog  = false;
                            this.loadCampaigns();
                        },
                        error: (err) => {
                            // Campaign created but settings failed — still reload
                            this.errorMessage   = this.extractError(err);
                            this.formSubmitting = false;
                            this.showFormDialog = false;
                            this.loadCampaigns();
                        }
                    });
                },
                error: (err) => {
                    this.errorMessage   = this.extractError(err);
                    this.formSubmitting = false;
                }
            });
        }
    }

    // ─── Delete dialog ────────────────────────────────────────────────────────────

    confirmDelete(campaign: CampaignOverview): void {
        this.deletingId   = campaign.campaign_id;
        this.deletingName = campaign.name;
        this.showDeleteConfirm = true;
    }

    cancelDelete(): void {
        this.showDeleteConfirm = false;
        this.deletingId   = null;
        this.deletingName = '';
    }

    executeDelete(): void {
        if (!this.deletingId) { return; }
        this.deleteSubmitting = true;
        this.campaignService.delete(this.deletingId).subscribe({
            next: () => {
                this.campaigns       = this.campaigns.filter(c => c.campaign_id !== this.deletingId);
                this.successMessage  = this.translate.instant('CAMPAIGNS.SUCCESS_DELETED');
                this.showDeleteConfirm = false;
                this.deletingId      = null;
                this.deletingName    = '';
                this.deleteSubmitting = false;
            },
            error: (err) => {
                this.errorMessage    = this.extractError(err);
                this.showDeleteConfirm = false;
                this.deleteSubmitting = false;
            }
        });
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    dismissMessages(): void { this.successMessage = ''; this.errorMessage = ''; }

    private extractError(err: any): string {
        if (err?.error?.detail) {
            if (Array.isArray(err.error.detail)) {
                return err.error.detail.map((e: any) => e.msg ?? JSON.stringify(e)).join(', ');
            }
            return err.error.detail;
        }
        return err?.message ?? 'An unexpected error occurred.';
    }

    trackById(_: number, item: CampaignOverview): string { return item.campaign_id; }
}
