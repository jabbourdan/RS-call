import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FollowUpToday } from '../../../services/dashboard/dashboard.models';

@Component({
    selector: 'app-recent-clients',
    imports: [TranslateModule],
    templateUrl: './recent-clients.component.html',
    styleUrl: './recent-clients.component.scss'
})
export class RecentClientsComponent {
    @Input() followUps: FollowUpToday[] = [];

    formatTime(isoDate: string): string {
        const date = new Date(isoDate);
        return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
}