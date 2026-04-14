import { Component, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TotalRevenueService } from './total-leads-in-campaign.service';
import { TranslateModule } from '@ngx-translate/core';
import { CampaignSummary } from '../../../services/dashboard/dashboard.models';

type FilterStatus = 'all' | 'active' | 'not active' | 'draft';

@Component({
    selector: 'app-leads-in-campaign',
    imports: [TranslateModule],
    templateUrl: './total-leads-in-campaign.component.html',
    styleUrl: './total-leads-in-campaign.component.scss'
})
export class TotalLeadsByCampaign implements OnChanges {

    @Input() campaigns: CampaignSummary[] = [];

    selectedFilter: FilterStatus = 'all';
    isFilterMenuOpen = false;

    readonly filterOptions: { value: FilterStatus; labelKey: string }[] = [
        { value: 'all',        labelKey: 'LEADS_PER_CAMPAIGN.FILTER_ALL' },
        { value: 'active',     labelKey: 'LEADS_PER_CAMPAIGN.FILTER_ACTIVE' },
        { value: 'not active', labelKey: 'LEADS_PER_CAMPAIGN.FILTER_NOT_ACTIVE' },
        { value: 'draft',      labelKey: 'LEADS_PER_CAMPAIGN.FILTER_DRAFT' },
    ];

    constructor(private totalRevenueService: TotalRevenueService) {}

    get currentFilterLabel(): string {
        return this.filterOptions.find(o => o.value === this.selectedFilter)?.labelKey ?? 'LEADS_PER_CAMPAIGN.FILTER_ALL';
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['campaigns']) {
            this.applyFilter(this.selectedFilter, changes['campaigns'].previousValue === undefined);
        }
    }

    onFilterChange(status: FilterStatus): void {
        this.selectedFilter = status;
        this.isFilterMenuOpen = false;
        this.applyFilter(status, false);
    }

    private applyFilter(status: FilterStatus, isFirstLoad: boolean): void {
        const filtered = status === 'all'
            ? this.campaigns
            : this.campaigns.filter(c => c.status === status);

        const series = [{ name: 'Leads', data: filtered.map(c => c.leads_count) }];
        const categories = filtered.map(c => c.name);

        if (isFirstLoad) {
            this.totalRevenueService.loadChart(series, categories);
        } else {
            this.totalRevenueService.updateChart(series, categories);
        }
    }

    toggleFilterMenu(): void {
        this.isFilterMenuOpen = !this.isFilterMenuOpen;
    }

    @HostListener('document:click', ['$event'])
    handleClickOutside(event: Event): void {
        const target = event.target as HTMLElement;
        if (!target.closest('.trezo-card-dropdown')) {
            this.isFilterMenuOpen = false;
        }
    }

}