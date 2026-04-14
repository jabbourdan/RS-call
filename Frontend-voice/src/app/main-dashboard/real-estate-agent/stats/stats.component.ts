import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-stats',
    imports: [TranslateModule],
    templateUrl: './stats.component.html',
    styleUrl: './stats.component.scss'
})
export class StatsComponent {
    @Input() totalLeads: number = 0;
    @Input() totalContacts: number = 0;
    @Input() followUpsCount: number = 0;
    @Input() closedDeals: number = 0;
}