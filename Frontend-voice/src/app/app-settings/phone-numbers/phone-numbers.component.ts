import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { OrgPhoneNumberService } from '../../services/org-phone-numbers/org-phone-number.service';
import { OrgPhoneNumber } from '../../services/org-phone-numbers/org-phone-number.models';
import { AuthService } from '../../services/auth/auth.service';

@Component({
    selector: 'app-phone-numbers',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    templateUrl: './phone-numbers.component.html',
    styleUrl: './phone-numbers.component.scss'
})
export class PhoneNumbersComponent implements OnInit {

    phoneNumbers: OrgPhoneNumber[] = [];
    isLoading = false;
    successMessage = '';
    errorMessage = '';

    // Add dialog
    showAddDialog = false;
    addPhoneNumber = '';
    addLabel = '';
    addSubmitting = false;
    addErrors: { phone?: string } = {};

    // Edit dialog
    showEditDialog = false;
    editingPhone: OrgPhoneNumber | null = null;
    editLabel = '';
    editSubmitting = false;

    // Delete dialog
    showDeleteConfirm = false;
    deletingPhone: OrgPhoneNumber | null = null;
    deleteSubmitting = false;

    // Org settings
    showIncludeInactive = false;

    // Role check
    isAdmin = false;

    constructor(
        private phoneNumberService: OrgPhoneNumberService,
        private authService: AuthService,
        private translate: TranslateService
    ) {}

    ngOnInit(): void {
        const user = this.authService.currentUser();
        this.isAdmin = user?.role === 'owner' || user?.role === 'admin';
        this.loadPhoneNumbers();
    }

    loadPhoneNumbers(): void {
        this.isLoading = true;
        this.errorMessage = '';
        this.phoneNumberService.list(this.showIncludeInactive).subscribe({
            next: (numbers) => {
                this.phoneNumbers = numbers;
                this.isLoading = false;
            },
            error: (err) => {
                this.errorMessage = this.extractError(err);
                this.isLoading = false;
            }
        });
    }

    toggleInactive(): void {
        this.showIncludeInactive = !this.showIncludeInactive;
        this.loadPhoneNumbers();
    }

    // ─── Add Phone ──────────────────────────────────────────────────────────────

    openAddDialog(): void {
        this.addPhoneNumber = '';
        this.addLabel = '';
        this.addErrors = {};
        this.showAddDialog = true;
    }

    closeAddDialog(): void {
        this.showAddDialog = false;
    }

    submitAdd(): void {
        this.addErrors = {};
        if (!this.addPhoneNumber.trim()) {
            this.addErrors.phone = this.translate.instant('PHONE_NUMBERS.ERROR_REQUIRED');
            return;
        }
        if (!/^\+[1-9]\d{1,14}$/.test(this.addPhoneNumber.trim())) {
            this.addErrors.phone = this.translate.instant('PHONE_NUMBERS.ERROR_E164');
            return;
        }

        this.addSubmitting = true;
        this.phoneNumberService.add({
            phone_number: this.addPhoneNumber.trim(),
            label: this.addLabel.trim() || undefined,
        }).subscribe({
            next: () => {
                this.successMessage = this.translate.instant('PHONE_NUMBERS.SUCCESS_ADDED');
                this.addSubmitting = false;
                this.showAddDialog = false;
                this.loadPhoneNumbers();
            },
            error: (err) => {
                this.errorMessage = this.extractError(err);
                this.addSubmitting = false;
            }
        });
    }

    // ─── Edit Phone ─────────────────────────────────────────────────────────────

    openEditDialog(phone: OrgPhoneNumber): void {
        this.editingPhone = phone;
        this.editLabel = phone.label ?? '';
        this.showEditDialog = true;
    }

    closeEditDialog(): void {
        this.showEditDialog = false;
        this.editingPhone = null;
    }

    submitEdit(): void {
        if (!this.editingPhone) return;
        this.editSubmitting = true;
        this.phoneNumberService.update(this.editingPhone.phone_id, {
            label: this.editLabel.trim() || undefined,
        }).subscribe({
            next: () => {
                this.successMessage = this.translate.instant('PHONE_NUMBERS.SUCCESS_UPDATED');
                this.editSubmitting = false;
                this.showEditDialog = false;
                this.editingPhone = null;
                this.loadPhoneNumbers();
            },
            error: (err) => {
                this.errorMessage = this.extractError(err);
                this.editSubmitting = false;
            }
        });
    }

    // ─── Delete (soft-delete) Phone ─────────────────────────────────────────────

    confirmDelete(phone: OrgPhoneNumber): void {
        this.deletingPhone = phone;
        this.showDeleteConfirm = true;
    }

    cancelDelete(): void {
        this.showDeleteConfirm = false;
        this.deletingPhone = null;
    }

    executeDelete(): void {
        if (!this.deletingPhone) return;
        this.deleteSubmitting = true;
        this.phoneNumberService.delete(this.deletingPhone.phone_id).subscribe({
            next: (res) => {
                let msg = this.translate.instant('PHONE_NUMBERS.SUCCESS_DELETED');
                if (res.warning) {
                    msg += ' ' + res.warning;
                }
                this.successMessage = msg;
                this.deleteSubmitting = false;
                this.showDeleteConfirm = false;
                this.deletingPhone = null;
                this.loadPhoneNumbers();
            },
            error: (err) => {
                this.errorMessage = this.extractError(err);
                this.deleteSubmitting = false;
                this.showDeleteConfirm = false;
            }
        });
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    dismissMessages(): void {
        this.successMessage = '';
        this.errorMessage = '';
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

    trackByPhoneId(_: number, item: OrgPhoneNumber): string {
        return item.phone_id;
    }
}
