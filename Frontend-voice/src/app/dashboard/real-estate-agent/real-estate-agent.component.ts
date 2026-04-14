import { Component } from '@angular/core';
import { WelcomeComponent } from './welcome/welcome.component';
import { StatsComponent } from './stats/stats.component';
import { TotalLeadsByCampaign } from './total-leads-in-campaign/total-leads-in-campaign.component';
import { RecentClientsComponent } from './recent-clients/recent-clients.component';

@Component({
    selector: 'app-real-estate-agent',
    imports: [WelcomeComponent, StatsComponent, TotalLeadsByCampaign, RecentClientsComponent],
    templateUrl: './real-estate-agent.component.html',
    styleUrl: './real-estate-agent.component.scss'
})
export class RealEstateAgentComponent {}