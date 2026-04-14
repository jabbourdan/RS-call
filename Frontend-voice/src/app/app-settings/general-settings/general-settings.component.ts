import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-general-settings',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    templateUrl: './general-settings.component.html',
    styleUrl: './general-settings.component.scss'
})
export class GeneralSettingsComponent {

    // Organisation
    orgName = 'Acme Corp';
    businessType = 'Real Estate';
    readonly plan = 'Professional';

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
