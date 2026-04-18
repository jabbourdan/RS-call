import { Component, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';

import { LeadService } from '../services/leads/lead.service';
import { DashboardService } from '../services/dashboard/dashboard.service';
import { CampaignSummary } from '../services/dashboard/dashboard.models';
import {
    Lead,
    LeadCreateRequest,
    LeadUpdateRequest,
    LeadPreviewColumnsResponse,
    LeadUploadResponse,
} from '../services/leads/lead.models';

const LS_EXTRA_COLS_KEY = 'leads_visible_extra_cols';

/** Map Hebrew backend status values → i18n translation keys */
export const STATUS_I18N_KEY: Record<string, string> = {
    'ממתין':       'LEADS.STATUS_WAITING',
    'ענה':         'LEADS.STATUS_ANSWERED',
    'לא ענה':      'LEADS.STATUS_NO_ANSWER',
    'לא רלוונטי':  'LEADS.STATUS_NOT_RELEVANT',
    'עסקה נסגרה':  'LEADS.STATUS_DEAL_CLOSED',
    'פולו אפ':     'LEADS.STATUS_FOLLOW_UP',
    'אל תתקשר':    'LEADS.STATUS_DO_NOT_CALL',
};

/** Tailwind badge classes per status */
export const STATUS_BADGE_CLASS: Record<string, string> = {
    'ממתין':       'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    'ענה':         'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    'לא ענה':      'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
    'לא רלוונטי':  'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    'עסקה נסגרה':  'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    'פולו אפ':     'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
    'אל תתקשר':    'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
};

@Component({
    selector: 'app-leads',
    imports: [RouterLink, CommonModule, FormsModule, TranslateModule],
    templateUrl: './leads.component.html',
    styleUrl: './leads.component.scss'
})
export class CLeadsComponent implements OnInit {

    // ─── Campaigns ───────────────────────────────────────────────────────────────

    campaigns: CampaignSummary[] = [];
    selectedCampaignId = 'all';

    // ─── Leads State ─────────────────────────────────────────────────────────────

    private leadsCache: Map<string, Lead[]> = new Map();
    allLeads: Lead[] = [];
    filteredLeads: Lead[] = [];
    searchQuery = '';

    isLoading = false;
    errorMessage = '';
    successMessage = '';

    // ─── Frontend Pagination ─────────────────────────────────────────────────────

    pageSize = 25;
    currentPage = 1;
    pagedLeads: Lead[] = [];

    // ─── Extra Data Columns ───────────────────────────────────────────────────────

    allExtraKeys: string[] = [];
    visibleExtraKeys: string[] = [];
    showColumnPicker = false;

    // ─── Status helpers (exposed for template) ───────────────────────────────────

    readonly statusI18n = STATUS_I18N_KEY;
    readonly statusBadge = STATUS_BADGE_CLASS;

    // ─── Single Lead Form Dialog ──────────────────────────────────────────────────

    showFormDialog = false;
    isEditMode = false;
    editingLeadId: string | null = null;
    editingLeadCampaignId: string | null = null;

    formData: LeadCreateRequest & { status?: string; follow_up_date?: string } = {
        phone_number: '',
        name: '',
        email: '',
        status: '',
        follow_up_date: '',
    };
    formCampaignId = '';
    formExtraData: { key: string; value: string }[] = [];
    formErrors: { phone_number?: string; email?: string; campaign?: string } = {};
    formSubmitting = false;
    formStatusOptions: string[] = ['ממתין', 'ענה', 'לא רלוונטי', 'עסקה נסגרה', 'פולו אפ', 'אל תתקשר'];

    // ─── Upload Dialog ────────────────────────────────────────────────────────────

    showUploadDialog = false;
    uploadStep: 1 | 2 = 1;
    uploadCampaignId = '';

    selectedFile: File | null = null;
    fileError = '';
    previewData: LeadPreviewColumnsResponse | null = null;
    previewLoading = false;

    mappedPhoneColumn = '';
    mappedNameColumn = '';
    mappedEmailColumn = '';
    mappingError = '';
    uploadSubmitting = false;
    uploadResult: LeadUploadResponse | null = null;

    // ─── Delete Confirm ───────────────────────────────────────────────────────────

    showDeleteConfirm = false;
    deletingLeadId: string | null = null;
    deletingLeadCampaignId: string | null = null;
    deleteSubmitting = false;

    constructor(
        private leadService: LeadService,
        private dashboardService: DashboardService,
        private translate: TranslateService,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        // Read query params from campaigns page navigation (?campaign=xxx&import=true)
        const qp = this.route.snapshot.queryParamMap;
        const preselectedCampaign = qp.get('campaign');
        const openImport = qp.get('import') === 'true';
        this.loadCampaigns(preselectedCampaign, openImport);
    }

    // ─── Load Campaigns then Leads ────────────────────────────────────────────────

    loadCampaigns(preselectedCampaignId?: string | null, openImport = false): void {
        this.isLoading = true;
        this.errorMessage = '';
        this.dashboardService.getOverview().subscribe({
            next: (overview) => {
                this.campaigns = overview.campaigns ?? [];
                if (preselectedCampaignId && this.campaigns.some(c => c.campaign_id === preselectedCampaignId)) {
                    this.selectedCampaignId = preselectedCampaignId;
                }
                this.loadLeadsForSelection();
                if (openImport) {
                    // Slight delay so campaigns are loaded before dialog opens
                    setTimeout(() => this.openUploadDialog(), 100);
                }
            },
            error: (err) => {
                this.errorMessage = this.extractError(err);
                this.isLoading = false;
            }
        });
    }

    onCampaignChange(): void {
        this.currentPage = 1;
        this.loadLeadsForSelection();
    }

    private loadLeadsForSelection(): void {
        this.isLoading = true;
        this.errorMessage = '';
        if (this.selectedCampaignId === 'all') {
            this.loadAllCampaignLeads();
        } else {
            this.loadSingleCampaignLeads(this.selectedCampaignId);
        }
    }

    private loadSingleCampaignLeads(campaignId: string): void {
        this.leadService.listLeads(campaignId).subscribe({
            next: (leads) => {
                const campaign = this.campaigns.find(c => c.campaign_id === campaignId);
                const enriched = leads.map(l => ({ ...l, campaign_name: campaign?.name ?? null }));
                this.leadsCache.set(campaignId, enriched);
                this.allLeads = enriched;
                this.computeExtraKeys();
                this.applySearch();
                this.isLoading = false;
            },
            error: (err) => {
                this.errorMessage = this.extractError(err);
                this.isLoading = false;
            }
        });
    }

    private loadAllCampaignLeads(): void {
        if (this.campaigns.length === 0) {
            this.allLeads = [];
            this.filteredLeads = [];
            this.pagedLeads = [];
            this.isLoading = false;
            return;
        }
        const requests = this.campaigns.map(c => this.leadService.listLeads(c.campaign_id));
        forkJoin(requests).subscribe({
            next: (results) => {
                const merged: Lead[] = [];
                results.forEach((leads, idx) => {
                    const campaign = this.campaigns[idx];
                    leads.forEach(l => merged.push({ ...l, campaign_name: campaign.name }));
                    this.leadsCache.set(campaign.campaign_id, leads);
                });
                this.allLeads = merged;
                this.computeExtraKeys();
                this.applySearch();
                this.isLoading = false;
            },
            error: (err) => {
                this.errorMessage = this.extractError(err);
                this.isLoading = false;
            }
        });
    }

    // ─── Extra Data Column Management ────────────────────────────────────────────

    private computeExtraKeys(): void {
        const keySet = new Set<string>();
        this.allLeads.forEach(l => {
            if (l.extra_data) { Object.keys(l.extra_data).forEach(k => keySet.add(k)); }
        });
        this.allExtraKeys = Array.from(keySet).sort();
        const saved = this.loadPersistedCols();
        this.visibleExtraKeys = saved.filter(k => keySet.has(k));
    }

    isExtraKeyVisible(key: string): boolean { return this.visibleExtraKeys.includes(key); }

    toggleExtraColumn(key: string): void {
        if (this.isExtraKeyVisible(key)) {
            this.visibleExtraKeys = this.visibleExtraKeys.filter(k => k !== key);
        } else {
            this.visibleExtraKeys = [...this.visibleExtraKeys, key];
        }
        this.persistCols();
    }

    getExtraValue(lead: Lead, key: string): string {
        const val = lead.extra_data?.[key];
        if (val === null || val === undefined) { return '—'; }
        return typeof val === 'object' ? JSON.stringify(val) : String(val);
    }

    private persistCols(): void {
        try { localStorage.setItem(LS_EXTRA_COLS_KEY, JSON.stringify(this.visibleExtraKeys)); } catch {}
    }
    private loadPersistedCols(): string[] {
        try { return JSON.parse(localStorage.getItem(LS_EXTRA_COLS_KEY) ?? '[]'); } catch { return []; }
    }

    // ─── Search + Pagination ──────────────────────────────────────────────────────

    applySearch(): void {
        const q = this.searchQuery.toLowerCase().trim();
        this.filteredLeads = q
            ? this.allLeads.filter(l =>
                (l.name ?? '').toLowerCase().includes(q) ||
                (l.email ?? '').toLowerCase().includes(q) ||
                (l.phone_number ?? '').includes(q) ||
                (l.campaign_name ?? '').toLowerCase().includes(q)
              )
            : [...this.allLeads];
        this.currentPage = 1;
        this.updatePage();
    }

    onSearch(): void { this.applySearch(); }

    get totalPages(): number {
        return Math.max(1, Math.ceil(this.filteredLeads.length / this.pageSize));
    }

    updatePage(): void {
        const start = (this.currentPage - 1) * this.pageSize;
        this.pagedLeads = this.filteredLeads.slice(start, start + this.pageSize);
    }

    goToPage(page: number): void {
        if (page < 1 || page > this.totalPages) { return; }
        this.currentPage = page;
        this.updatePage();
    }

    // ─── Form Dialog ──────────────────────────────────────────────────────────────

    openAddDialog(): void {
        this.isEditMode = false;
        this.editingLeadId = null;
        this.editingLeadCampaignId = null;
        this.formCampaignId = this.selectedCampaignId !== 'all'
            ? this.selectedCampaignId
            : (this.campaigns[0]?.campaign_id ?? '');
        this.formData = { phone_number: '', name: '', email: '', status: 'ממתין', follow_up_date: '' };
        this.formExtraData = [];
        this.formErrors = {};
        this.successMessage = '';
        this.formStatusOptions = ['ממתין', 'ענה', 'לא רלוונטי', 'עסקה נסגרה', 'פולו אפ', 'אל תתקשר'];
        this.showFormDialog = true;
    }

    openEditDialog(lead: Lead): void {
        this.isEditMode = true;
        this.editingLeadId = lead.lead_id;
        this.editingLeadCampaignId = lead.campaign_id;
        this.formCampaignId = lead.campaign_id;
        this.formData = {
            phone_number: lead.phone_number ?? '',
            name: lead.name ?? '',
            email: lead.email ?? '',
            status: lead.status.current,
            follow_up_date: lead.follow_up_date ? lead.follow_up_date.substring(0, 16) : '',
        };
        this.formStatusOptions = lead.status.options;
        this.formExtraData = lead.extra_data
            ? Object.entries(lead.extra_data).map(([key, value]) => ({
                key,
                value: value === null || value === undefined ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value)
              }))
            : [];
        this.formErrors = {};
        this.successMessage = '';
        this.showFormDialog = true;
    }

    closeFormDialog(): void {
        this.showFormDialog = false;
        this.formErrors = {};
    }

    addExtraField(): void { this.formExtraData.push({ key: '', value: '' }); }
    removeExtraField(index: number): void { this.formExtraData.splice(index, 1); }

    private buildExtraData(): Record<string, unknown> | undefined {
        const filtered = this.formExtraData.filter(row => row.key.trim());
        if (filtered.length === 0) { return undefined; }
        const result: Record<string, unknown> = {};
        filtered.forEach(row => {
            const v = row.value.trim();
            if (v === 'true') { result[row.key.trim()] = true; }
            else if (v === 'false') { result[row.key.trim()] = false; }
            else if (v !== '' && !isNaN(Number(v))) { result[row.key.trim()] = Number(v); }
            else { result[row.key.trim()] = v; }
        });
        return result;
    }

    get showFollowUpDate(): boolean { return this.formData.status === 'פולו אפ'; }

    validateForm(): boolean {
        this.formErrors = {};
        if (!this.isEditMode && !this.formData.phone_number?.trim()) {
            this.formErrors.phone_number = this.translate.instant('LEADS.ERROR_PHONE_REQUIRED');
        }
        if (this.formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email)) {
            this.formErrors.email = this.translate.instant('LEADS.ERROR_EMAIL_INVALID');
        }
        if (!this.formCampaignId) {
            this.formErrors.campaign = this.translate.instant('LEADS.ERROR_CAMPAIGN_REQUIRED');
        }
        return Object.keys(this.formErrors).length === 0;
    }

    submitForm(): void {
        if (!this.validateForm()) { return; }
        this.formSubmitting = true;
        this.successMessage = '';
        this.errorMessage = '';
        const extraData = this.buildExtraData();

        if (this.isEditMode && this.editingLeadId && this.editingLeadCampaignId) {
            const payload: LeadUpdateRequest = {
                ...(this.formData.phone_number?.trim() ? { phone_number: this.formData.phone_number.trim() } : {}),
                ...(this.formData.name?.trim() ? { name: this.formData.name.trim() } : {}),
                ...(this.formData.email?.trim() ? { email: this.formData.email.trim() } : {}),
                ...(this.formData.status ? { status: this.formData.status } : {}),
                follow_up_date: this.formData.status === 'פולו אפ' && this.formData.follow_up_date
                    ? this.formData.follow_up_date : null,
                ...(extraData ? { extra_data: extraData } : {}),
            };
            this.leadService.updateLead(this.editingLeadCampaignId, this.editingLeadId, payload).subscribe({
                next: () => {
                    this.successMessage = this.translate.instant('LEADS.SUCCESS_UPDATED');
                    this.formSubmitting = false;
                    this.showFormDialog = false;
                    this.refreshCurrentSelection();
                },
                error: (err) => { this.errorMessage = this.extractError(err); this.formSubmitting = false; }
            });
        } else {
            const payload: LeadCreateRequest = {
                phone_number: this.formData.phone_number!.trim(),
                ...(this.formData.name?.trim() ? { name: this.formData.name.trim() } : {}),
                ...(this.formData.email?.trim() ? { email: this.formData.email.trim() } : {}),
                ...(extraData ? { extra_data: extraData } : {}),
            };
            this.leadService.createLead(this.formCampaignId, payload).subscribe({
                next: () => {
                    this.successMessage = this.translate.instant('LEADS.SUCCESS_CREATED');
                    this.formSubmitting = false;
                    this.showFormDialog = false;
                    this.refreshCurrentSelection();
                },
                error: (err) => { this.errorMessage = this.extractError(err); this.formSubmitting = false; }
            });
        }
    }

    // ─── Delete ───────────────────────────────────────────────────────────────────

    confirmDelete(lead: Lead): void {
        this.deletingLeadId = lead.lead_id;
        this.deletingLeadCampaignId = lead.campaign_id;
        this.showDeleteConfirm = true;
    }

    cancelDelete(): void {
        this.showDeleteConfirm = false;
        this.deletingLeadId = null;
        this.deletingLeadCampaignId = null;
    }

    executeDelete(): void {
        if (!this.deletingLeadId || !this.deletingLeadCampaignId) { return; }
        this.deleteSubmitting = true;
        this.leadService.deleteLead(this.deletingLeadCampaignId, this.deletingLeadId).subscribe({
            next: () => {
                this.successMessage = this.translate.instant('LEADS.SUCCESS_DELETED');
                this.showDeleteConfirm = false;
                this.deletingLeadId = null;
                this.deletingLeadCampaignId = null;
                this.deleteSubmitting = false;
                this.refreshCurrentSelection();
            },
            error: (err) => {
                this.errorMessage = this.extractError(err);
                this.showDeleteConfirm = false;
                this.deleteSubmitting = false;
            }
        });
    }

    // ─── Upload Dialog ────────────────────────────────────────────────────────────

    openUploadDialog(): void {
        this.showUploadDialog = true;
        this.uploadStep = 1;
        this.uploadCampaignId = this.selectedCampaignId !== 'all'
            ? this.selectedCampaignId
            : (this.campaigns[0]?.campaign_id ?? '');
        this.selectedFile = null;
        this.fileError = '';
        this.previewData = null;
        this.mappedPhoneColumn = '';
        this.mappedNameColumn = '';
        this.mappedEmailColumn = '';
        this.mappingError = '';
        this.uploadResult = null;
        this.successMessage = '';
        this.showColumnPicker = false;
    }

    closeUploadDialog(): void { this.showUploadDialog = false; }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0] ?? null;
        this.fileError = '';
        if (!file) { this.selectedFile = null; return; }
        const allowed = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
        if (!allowed.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
            this.fileError = 'Only CSV or Excel files are allowed.';
            this.selectedFile = null;
            return;
        }
        this.selectedFile = file;
    }

    previewFile(): void {
        if (!this.selectedFile) { this.fileError = 'Please select a file.'; return; }
        if (!this.uploadCampaignId) { this.fileError = this.translate.instant('LEADS.ERROR_CAMPAIGN_REQUIRED'); return; }
        this.previewLoading = true;
        this.fileError = '';
        this.leadService.previewColumns(this.uploadCampaignId, this.selectedFile).subscribe({
            next: (data) => { this.previewData = data; this.previewLoading = false; this.uploadStep = 2; },
            error: (err) => { this.fileError = this.extractError(err); this.previewLoading = false; }
        });
    }

    submitUpload(): void {
        this.mappingError = '';
        if (!this.mappedPhoneColumn) {
            this.mappingError = this.translate.instant('LEADS.ERROR_PHONE_COL_REQUIRED');
            return;
        }
        if (!this.selectedFile) { return; }
        this.uploadSubmitting = true;
        this.leadService.bulkUpload(
            this.uploadCampaignId, this.selectedFile, this.mappedPhoneColumn,
            this.mappedNameColumn || undefined, this.mappedEmailColumn || undefined
        ).subscribe({
            next: (result) => { this.uploadResult = result; this.uploadSubmitting = false; this.refreshCurrentSelection(); },
            error: (err) => { this.mappingError = this.extractError(err); this.uploadSubmitting = false; }
        });
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────────

    private refreshCurrentSelection(): void {
        this.leadsCache.clear();
        this.loadLeadsForSelection();
    }

    private extractError(err: any): string {
        if (err?.error?.detail) {
            if (Array.isArray(err.error.detail)) {
                return err.error.detail.map((e: any) => e.msg ?? JSON.stringify(e)).join(', ');
            }
            return err.error.detail;
        }
        return err?.message ?? 'An unexpected error occurred.';
    }

    dismissMessages(): void { this.successMessage = ''; this.errorMessage = ''; }

    getCampaignName(campaignId: string): string {
        return this.campaigns.find(c => c.campaign_id === campaignId)?.name ?? campaignId;
    }
}
