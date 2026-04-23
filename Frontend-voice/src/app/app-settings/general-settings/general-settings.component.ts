import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth/auth.service';
import { OrgSettingsService } from '../../services/org-settings/org-settings.service';
import { OrgSettings } from '../../services/org-settings/org-settings.models';
import { WhatsappLinkService } from '../../services/whatsapp/whatsapp-link.service';

@Component({
    selector: 'app-general-settings',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    templateUrl: './general-settings.component.html',
    styleUrl: './general-settings.component.scss',
})
export class GeneralSettingsComponent implements OnInit {
    private readonly orgSettingsService = inject(OrgSettingsService);
    private readonly authService = inject(AuthService);
    private readonly whatsapp = inject(WhatsappLinkService);
    private readonly translate = inject(TranslateService);

    settings: OrgSettings | null = null;
    isLoading = false;
    errorMessage = '';
    successMessage = '';

    isEditing = false;
    editOrgName = '';
    editBusType = '';
    validationError = '';
    isSaving = false;

    readonly isAdmin = computed(() => {
        const role = this.authService.currentUser()?.role;
        return role === 'owner' || role === 'admin';
    });

    ngOnInit(): void {
        this.loadSettings();
    }

    loadSettings(): void {
        this.isLoading = true;
        this.errorMessage = '';
        this.orgSettingsService.get().subscribe({
            next: (settings) => {
                this.settings = settings;
                this.isLoading = false;
            },
            error: (err) => {
                this.errorMessage = this.extractError(err);
                this.isLoading = false;
            },
        });
    }

    enterEdit(): void {
        if (!this.settings || !this.isAdmin()) return;
        this.editOrgName = this.settings.org_name;
        this.editBusType = this.settings.bus_type ?? '';
        this.validationError = '';
        this.isEditing = true;
    }

    cancelEdit(): void {
        this.isEditing = false;
        this.validationError = '';
    }

    save(): void {
        if (!this.settings) return;
        const orgName = this.editOrgName.trim();
        if (orgName.length < 2) {
            this.validationError = this.translate.instant(
                'APP_SETTINGS.FIELD_ORG_NAME_MIN_LENGTH'
            );
            return;
        }
        this.validationError = '';
        this.isSaving = true;
        this.orgSettingsService
            .update({
                org_name: orgName,
                bus_type: this.editBusType.trim() || null,
            })
            .subscribe({
                next: (updated) => {
                    this.settings = updated;
                    this.isEditing = false;
                    this.isSaving = false;
                    this.successMessage = this.translate.instant(
                        'APP_SETTINGS.SAVE_SUCCESS'
                    );
                },
                error: (err) => {
                    this.errorMessage = this.extractError(err);
                    this.isSaving = false;
                },
            });
    }

    requestUpgrade(): void {
        if (!this.settings) return;
        const message = this.translate.instant('APP_SETTINGS.UPGRADE_WA_MESSAGE', {
            org_name: this.settings.org_name,
            plan: this.settings.plan,
        });
        const url = this.whatsapp.buildChatUrl(
            environment.adminWhatsAppNumber,
            message
        );
        if (url) {
            window.open(url, '_blank', 'noopener');
        }
    }

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
}
