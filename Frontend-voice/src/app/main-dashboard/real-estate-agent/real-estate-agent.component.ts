import { Component, OnInit } from '@angular/core';
import { WelcomeComponent } from './welcome/welcome.component';
import { StatsComponent } from './stats/stats.component';
import { TotalLeadsByCampaign } from './total-leads-in-campaign/total-leads-in-campaign.component';
import { RecentClientsComponent } from './recent-clients/recent-clients.component';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { DashboardOverview, FollowUpToday, CampaignSummary } from '../../services/dashboard/dashboard.models';

@Component({
    selector: 'app-real-estate-agent',
    imports: [WelcomeComponent, StatsComponent, TotalLeadsByCampaign, RecentClientsComponent],
    templateUrl: './real-estate-agent.component.html',
    styleUrl: './real-estate-agent.component.scss'
})
export class RealEstateAgentComponent implements OnInit {

    totalLeads = 0;
    totalContacts = 0;
    closedDeals = 0;
    followUps: FollowUpToday[] = [];
    campaigns: CampaignSummary[] = [];

    constructor(private dashboardService: DashboardService) {}

    ngOnInit(): void {
        this.dashboardService.getOverview().subscribe({
            next: (data: DashboardOverview) => {
                this.totalLeads = data.total_leads;
                this.totalContacts = data.total_contacts;
                this.closedDeals = data.closed_deals;
                this.followUps = data.follow_ups_today;
                this.campaigns = data.campaigns;
            },
            error: (err) => {
                console.error('Failed to load dashboard overview', err);
            }
        });
    }

}