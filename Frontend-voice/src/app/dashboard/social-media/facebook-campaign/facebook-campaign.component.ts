import { Component, HostListener } from '@angular/core';
import { FacebookCampaignService } from './facebook-campaign.service';

@Component({
    selector: 'app-facebook-campaign',
    imports: [],
    templateUrl: './facebook-campaign.component.html',
    styleUrl: './facebook-campaign.component.scss'
})
export class FacebookCampaignComponent {

    selectedTimeframe: string = 'This Week'; // Default selection
    chartData: { [key: string]: { series: { name: string; type: string; data: number[] }[]; categories: string[] } };

    constructor(
        private facebookCampaignService: FacebookCampaignService
    ) {
        // Define chart data for each timeframe
        this.chartData = {
            'This Day': {
                series: [
                    { name: "Impressions", type: "column", data: [100, 200, 150, 300, 250] },
                    { name: "Clicks", type: "column", data: [50, 100, 75, 150, 125] },
                    { name: "CTR", type: "column", data: [10, 15, 20, 25, 30] },
                    { name: "Cost Per Conversion", type: "line", data: [5, 10, 8, 12, 15] }
                ],
                categories: ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM']
            },
            'This Week': {
                series: [
                    { name: "Impressions", type: "column", data: [400, 600, 200, 700, 480, 380, 600] },
                    { name: "Clicks", type: "column", data: [500, 420, 520, 570, 300, 400, 180] },
                    { name: "CTR", type: "column", data: [450, 400, 330, 300, 410, 530, 380] },
                    { name: "Cost Per Conversion", type: "line", data: [480, 650, 500, 800, 550, 800, 900] }
                ],
                categories: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
            },
            'This Month': {
                series: [
                    { name: "Impressions", type: "column", data: [1000, 1200, 1100, 1300] },
                    { name: "Clicks", type: "column", data: [800, 900, 850, 950] },
                    { name: "CTR", type: "column", data: [750, 780, 770, 790] },
                    { name: "Cost Per Conversion", type: "line", data: [850, 870, 860, 880] }
                ],
                categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
            },
            'This Year': {
                series: [
                    { name: "Impressions", type: "column", data: [4000, 5000, 4500, 5500] },
                    { name: "Clicks", type: "column", data: [3000, 3500, 3200, 3800] },
                    { name: "CTR", type: "column", data: [2800, 3000, 2900, 3100] },
                    { name: "Cost Per Conversion", type: "line", data: [3300, 3500, 3400, 3600] }
                ],
                categories: ['Q1', 'Q2', 'Q3', 'Q4']
            }
        };
    }

    ngOnInit(): void {
        const defaultData = this.chartData[this.selectedTimeframe];
        this.facebookCampaignService.loadChart(defaultData.series, defaultData.categories);
    }
    
    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe; // Update dropdown button text
        const selectedData = this.chartData[timeframe];
        this.facebookCampaignService.updateChart(selectedData.series, selectedData.categories);
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