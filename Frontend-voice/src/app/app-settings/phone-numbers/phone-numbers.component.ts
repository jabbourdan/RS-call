import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { environment } from '../../../environments/environment';
import { OrgPhoneNumberService } from '../../services/org-phone-numbers/org-phone-number.service';
import { OrgPhoneNumber } from '../../services/org-phone-numbers/org-phone-number.models';
import { AuthService } from '../../services/auth/auth.service';
import { OrgSettingsService } from '../../services/org-settings/org-settings.service';
import { WhatsappLinkService } from '../../services/whatsapp/whatsapp-link.service';

@Component({
    selector: 'app-phone-numbers',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    templateUrl: './phone-numbers.component.html',
    styleUrl: './phone-numbers.component.scss',
})
export class PhoneNumbersComponent implements OnInit {
    private readonly phoneNumberService = inject(OrgPhoneNumberService);
    private readonly authService = inject(AuthService);
    private readonly orgSettingsService = inject(OrgSettingsService);
    private readonly whatsapp = inject(WhatsappLinkService);
    private readonly translate = inject(TranslateService);

    phoneNumbers: OrgPhoneNumber[] = [];
    isLoading = false;
    successMessage = '';
    errorMessage = '';

    // Edit dialog
    showEditDialog = false;
    editingPhone: OrgPhoneNumber | null = null;
    editLabel = '';
    editSubmitting = false;

    // Delete dialog
    showDeleteConfirm = false;
    deletingPhone: OrgPhoneNumber | null = null;
    deleteSubmitting = false;

    // Filter
    showIncludeInactive = false;

    // Role check
    isAdmin = false;

    // Plan limit (for the WhatsApp request message)
    maxPhoneNumbers: number | null = null;
    orgName = '';

    ngOnInit(): void {
        const user = this.authService.currentUser();
        this.isAdmin = user?.role === 'owner' || user?.role === 'admin';
        this.loadPhoneNumbers();
        this.loadOrgSettings();
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
            },
        });
    }

    loadOrgSettings(): void {
        this.orgSettingsService.get().subscribe({
            next: (settings) => {
                this.maxPhoneNumbers = settings.max_phone_numbers;
                this.orgName = settings.org_name;
            },
            error: () => {
                this.maxPhoneNumbers = null;
            },
        });
    }

    toggleInactive(): void {
        this.showIncludeInactive = !this.showIncludeInactive;
        this.loadPhoneNumbers();
    }

    // ─── Request new number (WhatsApp — visible to all authenticated users) ─────

    onRequestNewNumber(): void {
        const message = this.translate.instant('PHONE_NUMBERS.REQUEST_WA_MESSAGE', {
            org_name: this.orgName || '',
            current: this.phoneNumbers.length,
            max: this.maxPhoneNumbers ?? '—',
        });
        const url = this.whatsapp.buildChatUrl(
            environment.adminWhatsAppNumber,
            message
        );
        if (url) {
            window.open(url, '_blank', 'noopener');
        }
    }

    // ─── Edit Phone ──────────────────────────────────────────────────────────────

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
        this.phoneNumberService
            .update(this.editingPhone.phone_id, {
                label: this.editLabel.trim() || undefined,
            })
            .subscribe({
                next: () => {
                    this.successMessage = this.translate.instant(
                        'PHONE_NUMBERS.SUCCESS_UPDATED'
                    );
                    this.editSubmitting = false;
                    this.showEditDialog = false;
                    this.editingPhone = null;
                    this.loadPhoneNumbers();
                },
                error: (err) => {
                    this.errorMessage = this.extractError(err);
                    this.editSubmitting = false;
                },
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
            },
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
                return err.error.detail
                    .map((e: any) => e.msg ?? JSON.stringify(e))
                    .join(', ');
            }
            return err.error.detail;
        }
        return err?.message ?? 'An unexpected error occurred.';
    }

    trackByPhoneId(_: number, item: OrgPhoneNumber): string {
        return item.phone_id;
    }
}
