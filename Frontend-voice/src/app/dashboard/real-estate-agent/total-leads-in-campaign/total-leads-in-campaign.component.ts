import { Component, HostListener } from '@angular/core';
import { TotalRevenueService } from './total-leads-in-campaign.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-leads-in-campaign',
    imports: [TranslateModule],
    templateUrl: './total-leads-in-campaign.component.html',
    styleUrl: './total-leads-in-campaign.component.scss'
})
export class TotalLeadsByCampaign {

    selectedTimeframe: string = 'Monthly';  // Default selection
    chartData: { [key: string]: { series: any[], categories: string[] } };

    constructor(
        private totalRevenueService: TotalRevenueService
    ) {
        this.chartData = {
            'Daily': {
                series: [{ name: "Net Profit", data: [5, 8, 3, 7, 6, 9, 4] }],
                categories: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00']
            },
            'Weekly': {
                series: [{ name: "Net Profit", data: [30, 40, 35, 50, 45, 60, 55] }],
                categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
            },
            'Monthly': {
                series: [{ name: "Net Profit", data: [15, 12, 30, 55, 25, 38, 15, 30, 12, 15, 30, 48] }],
                categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            },
            'Yearly': {
                series: [{ name: "Net Profit", data: [180, 200, 250, 270, 300] }],
                categories: ['2021', '2022', '2023', '2024', '2025']
            }
        };
    }

    ngOnInit(): void {
        // Load chart with the default selected timeframe (Monthly)
        const defaultData = this.chartData[this.selectedTimeframe];
        this.totalRevenueService.loadChart(defaultData.series, defaultData.categories);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe;
        const selectedData = this.chartData[timeframe];
        this.totalRevenueService.updateChart(selectedData.series, selectedData.categories);
    }
    
    // Card Header Menu
    isCardHeaderOpen = false;
    toggleCardHeaderMenu() {
        this.isCardHeaderOpen = !this.isCardHeaderOpen;
    }
    @HostListener('document:click', ['$event'])
    handleClickOutside(event: Event) {
        const target = event.target as HTMLElement;
        if (!target.closest('.trezo-card-dropdown')) {
            this.isCardHeaderOpen = false;
        }
    }

}