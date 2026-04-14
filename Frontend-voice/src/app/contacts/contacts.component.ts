import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ContactService } from '../services/contacts/contact.service';
import {
    Contact,
    ContactCreateRequest,
    ContactUpdateRequest,
    ContactPreviewColumnsResponse,
    ContactUploadResponse,
} from '../services/contacts/contact.models';

const LS_EXTRA_COLS_KEY = 'contacts_visible_extra_cols';

@Component({
    selector: 'app-contacts',
    imports: [RouterLink, CommonModule, FormsModule, FileUploadModule, TranslateModule],
    templateUrl: './contacts.component.html',
    styleUrl: './contacts.component.scss'
})
export class CContactsComponent implements OnInit {

    // ─── State ───────────────────────────────────────────────────────────────────

    contacts: Contact[] = [];
    filteredContacts: Contact[] = [];
    searchQuery = '';

    isLoading = false;
    errorMessage = '';
    successMessage = '';

    // ─── Extra Data Columns ───────────────────────────────────────────────────────

    /** All unique extra_data keys found across all contacts */
    allExtraKeys: string[] = [];
    /** Keys currently shown as table columns */
    visibleExtraKeys: string[] = [];
    /** Whether the column picker dropdown is open */
    showColumnPicker = false;

    // ─── Single Contact Form Dialog ───────────────────────────────────────────────

    showFormDialog = false;
    isEditMode = false;
    editingContactId: string | null = null;

    formData: ContactCreateRequest = { name: '', phone_number: '', email: '' };
    /** Dynamic extra_data rows: [{key, value}] */
    formExtraData: { key: string; value: string }[] = [];
    formErrors: { name?: string; email?: string } = {};
    formSubmitting = false;

    // ─── Upload Dialog ────────────────────────────────────────────────────────────

    showUploadDialog = false;
    uploadStep: 1 | 2 = 1;

    selectedFile: File | null = null;
    fileError = '';
    previewData: ContactPreviewColumnsResponse | null = null;
    previewLoading = false;

    mappedNameColumn = '';
    mappedPhoneColumn = '';
    mappedEmailColumn = '';
    mappingError = '';
    uploadSubmitting = false;
    uploadResult: ContactUploadResponse | null = null;

    // ─── Delete Confirm ───────────────────────────────────────────────────────────

    showDeleteConfirm = false;
    deletingContactId: string | null = null;
    deleteSubmitting = false;

    // ─── Constructor ──────────────────────────────────────────────────────────────

    constructor(
        private contactService: ContactService,
        private translate: TranslateService
    ) {}

    ngOnInit(): void {
        this.loadContacts();
    }

    // ─── Load Contacts ────────────────────────────────────────────────────────────

    loadContacts(): void {
        this.isLoading = true;
        this.errorMessage = '';
        this.contactService.listContacts().subscribe({
            next: (data) => {
                this.contacts = data;
                this.computeExtraKeys();
                this.applySearch();
                this.isLoading = false;
            },
            error: (err) => {
                this.errorMessage = err?.error?.detail ?? this.translate.instant('CONTACTS.ERROR_LOAD');
                this.isLoading = false;
            }
        });
    }

    // ─── Extra Data Column Management ────────────────────────────────────────────

    private computeExtraKeys(): void {
        const keySet = new Set<string>();
        this.contacts.forEach(c => {
            if (c.extra_data) {
                Object.keys(c.extra_data).forEach(k => keySet.add(k));
            }
        });
        this.allExtraKeys = Array.from(keySet).sort();

        // Restore persisted selection, keeping only keys that still exist
        const saved = this.loadPersistedCols();
        this.visibleExtraKeys = saved.filter(k => keySet.has(k));
    }

    isExtraKeyVisible(key: string): boolean {
        return this.visibleExtraKeys.includes(key);
    }

    toggleExtraColumn(key: string): void {
        if (this.isExtraKeyVisible(key)) {
            this.visibleExtraKeys = this.visibleExtraKeys.filter(k => k !== key);
        } else {
            this.visibleExtraKeys = [...this.visibleExtraKeys, key];
        }
        this.persistCols();
    }

    getExtraValue(contact: Contact, key: string): string {
        const val = contact.extra_data?.[key];
        if (val === null || val === undefined) { return '—'; }
        return typeof val === 'object' ? JSON.stringify(val) : String(val);
    }

    private persistCols(): void {
        try { localStorage.setItem(LS_EXTRA_COLS_KEY, JSON.stringify(this.visibleExtraKeys)); } catch {}
    }

    private loadPersistedCols(): string[] {
        try { return JSON.parse(localStorage.getItem(LS_EXTRA_COLS_KEY) ?? '[]'); } catch { return []; }
    }

    // ─── Search ───────────────────────────────────────────────────────────────────

    applySearch(): void {
        const q = this.searchQuery.toLowerCase().trim();
        this.filteredContacts = q
            ? this.contacts.filter(c =>
                c.name.toLowerCase().includes(q) ||
                (c.email ?? '').toLowerCase().includes(q) ||
                (c.phone_number ?? '').includes(q)
              )
            : [...this.contacts];
    }

    onSearch(): void {
        this.applySearch();
    }

    // ─── Form Dialog ──────────────────────────────────────────────────────────────

    openAddDialog(): void {
        this.isEditMode = false;
        this.editingContactId = null;
        this.formData = { name: '', phone_number: '', email: '' };
        this.formExtraData = [];
        this.formErrors = {};
        this.successMessage = '';
        this.showFormDialog = true;
    }

    openEditDialog(contact: Contact): void {
        this.isEditMode = true;
        this.editingContactId = contact.contact_id;
        this.formData = {
            name: contact.name,
            phone_number: contact.phone_number ?? '',
            email: contact.email ?? ''
        };
        // Populate dynamic extra_data rows from existing contact data
        this.formExtraData = contact.extra_data
            ? Object.entries(contact.extra_data).map(([key, value]) => ({
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

    // ─── Dynamic Extra Data Rows ──────────────────────────────────────────────────

    addExtraField(): void {
        this.formExtraData.push({ key: '', value: '' });
    }

    removeExtraField(index: number): void {
        this.formExtraData.splice(index, 1);
    }

    private buildExtraData(): Record<string, unknown> | undefined {
        const filtered = this.formExtraData.filter(row => row.key.trim());
        if (filtered.length === 0) { return undefined; }
        const result: Record<string, unknown> = {};
        filtered.forEach(row => {
            // Try to parse numbers/booleans, otherwise keep as string
            const v = row.value.trim();
            if (v === 'true') { result[row.key.trim()] = true; }
            else if (v === 'false') { result[row.key.trim()] = false; }
            else if (v !== '' && !isNaN(Number(v))) { result[row.key.trim()] = Number(v); }
            else { result[row.key.trim()] = v; }
        });
        return result;
    }

    // ─── Validate & Submit Form ───────────────────────────────────────────────────

    validateForm(): boolean {
        this.formErrors = {};
        if (!this.formData.name || !this.formData.name.trim()) {
            this.formErrors.name = this.translate.instant('CONTACTS.ERROR_NAME_REQUIRED');
        }
        if (this.formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email)) {
            this.formErrors.email = this.translate.instant('CONTACTS.ERROR_EMAIL_INVALID');
        }
        return Object.keys(this.formErrors).length === 0;
    }

    submitForm(): void {
        if (!this.validateForm()) { return; }
        this.formSubmitting = true;
        this.successMessage = '';
        this.errorMessage = '';

        const extraData = this.buildExtraData();
        const payload: ContactCreateRequest = {
            name: this.formData.name.trim(),
            ...(this.formData.phone_number?.trim() ? { phone_number: this.formData.phone_number.trim() } : {}),
            ...(this.formData.email?.trim() ? { email: this.formData.email.trim() } : {}),
            ...(extraData ? { extra_data: extraData } : {}),
        };

        if (this.isEditMode && this.editingContactId) {
            const updatePayload: ContactUpdateRequest = payload;
            this.contactService.updateContact(this.editingContactId, updatePayload).subscribe({
                next: () => {
                    this.successMessage = this.translate.instant('CONTACTS.SUCCESS_UPDATED');
                    this.formSubmitting = false;
                    this.showFormDialog = false;
                    this.loadContacts();
                },
                error: (err) => {
                    this.errorMessage = this.extractError(err);
                    this.formSubmitting = false;
                }
            });
        } else {
            this.contactService.createContact(payload).subscribe({
                next: () => {
                    this.successMessage = this.translate.instant('CONTACTS.SUCCESS_CREATED');
                    this.formSubmitting = false;
                    this.showFormDialog = false;
                    this.loadContacts();
                },
                error: (err) => {
                    this.errorMessage = this.extractError(err);
                    this.formSubmitting = false;
                }
            });
        }
    }

    // ─── Delete ───────────────────────────────────────────────────────────────────

    confirmDelete(contactId: string): void {
        this.deletingContactId = contactId;
        this.showDeleteConfirm = true;
    }

    cancelDelete(): void {
        this.showDeleteConfirm = false;
        this.deletingContactId = null;
    }

    executeDelete(): void {
        if (!this.deletingContactId) { return; }
        this.deleteSubmitting = true;
        this.contactService.deleteContact(this.deletingContactId).subscribe({
            next: () => {
                this.successMessage = this.translate.instant('CONTACTS.SUCCESS_DELETED');
                this.showDeleteConfirm = false;
                this.deletingContactId = null;
                this.deleteSubmitting = false;
                this.loadContacts();
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
        this.selectedFile = null;
        this.fileError = '';
        this.previewData = null;
        this.mappedNameColumn = '';
        this.mappedPhoneColumn = '';
        this.mappedEmailColumn = '';
        this.mappingError = '';
        this.uploadResult = null;
        this.successMessage = '';
        this.showColumnPicker = false;
    }

    closeUploadDialog(): void {
        this.showUploadDialog = false;
    }

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
        this.previewLoading = true;
        this.fileError = '';
        this.contactService.previewColumns(this.selectedFile).subscribe({
            next: (data) => {
                this.previewData = data;
                this.previewLoading = false;
                this.uploadStep = 2;
            },
            error: (err) => {
                this.fileError = this.extractError(err);
                this.previewLoading = false;
            }
        });
    }

    submitUpload(): void {
        this.mappingError = '';
        if (!this.mappedNameColumn) {
            this.mappingError = this.translate.instant('CONTACTS.ERROR_NAME_COL_REQUIRED');
            return;
        }
        if (!this.selectedFile) { return; }
        this.uploadSubmitting = true;
        this.contactService.bulkUpload(
            this.selectedFile,
            this.mappedNameColumn,
            this.mappedPhoneColumn || undefined,
            this.mappedEmailColumn || undefined
        ).subscribe({
            next: (result) => {
                this.uploadResult = result;
                this.uploadSubmitting = false;
                this.loadContacts();
            },
            error: (err) => {
                this.mappingError = this.extractError(err);
                this.uploadSubmitting = false;
            }
        });
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────────

    private extractError(err: any): string {
        if (err?.error?.detail) {
            if (Array.isArray(err.error.detail)) {
                return err.error.detail.map((e: any) => e.msg ?? JSON.stringify(e)).join(', ');
            }
            return err.error.detail;
        }
        return err?.message ?? 'An unexpected error occurred.';
    }

    dismissMessages(): void {
        this.successMessage = '';
        this.errorMessage = '';
    }
}