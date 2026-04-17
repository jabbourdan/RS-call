import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { OrgPhoneNumberService } from '../../services/org-phone-numbers/org-phone-number.service';
import { OrgPhoneNumber } from '../../services/org-phone-numbers/org-phone-number.models';

@Component({
    selector: 'app-general-settings',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
    templateUrl: './general-settings.component.html',
    styleUrl: './general-settings.component.scss'
})
export class GeneralSettingsComponent implements OnInit {

    // Organisation
    orgName = 'Acme Corp';
    businessType = 'Real Estate';
    readonly plan = 'Professional';

    // Phone numbers (loaded from API)
    phoneNumbers: OrgPhoneNumber[] = [];

    // Dialing config
    maxCallsToUnanswered = 3;
    callingAlgorithm: 'priority' | 'round-robin' = 'priority';
    cooldownMinutes = 60;
    changeNumberAfter = 10;

    // Locale
    language: 'en' | 'ar' | 'he' = 'en';
    timezone = 'America/New_York';

    readonly timezones = [
        'America/New_York',
        'America/Chicago',
        'America/Denver',
        'America/Los_Angeles',
        'Europe/London',
        'Europe/Paris',
        'Asia/Jerusalem',
        'Asia/Riyadh',
        'Asia/Dubai',
        'Asia/Tokyo',
        'Australia/Sydney',
        'UTC'
    ];

    constructor(private phoneNumberService: OrgPhoneNumberService) {}

    ngOnInit(): void {
        this.phoneNumberService.list().subscribe({
            next: (numbers) => { this.phoneNumbers = numbers; },
            error: () => { this.phoneNumbers = []; }
        });
    }

    onSave(): void {
        console.log('[GeneralSettings] Save triggered', {
            orgName: this.orgName,
            businessType: this.businessType,
            callingAlgorithm: this.callingAlgorithm,
            maxCallsToUnanswered: this.maxCallsToUnanswered,
            cooldownMinutes: this.cooldownMinutes,
            changeNumberAfter: this.changeNumberAfter,
            language: this.language,
            timezone: this.timezone,
        });
    }

    onCancel(): void {
        // Future: reset to server values
    }
}
