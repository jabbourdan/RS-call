import { Component, HostListener } from '@angular/core';
import { RecentEarningsService } from './recent-earnings.service';

@Component({
    selector: 'app-recent-earnings',
    imports: [],
    templateUrl: './recent-earnings.component.html',
    styleUrl: './recent-earnings.component.scss'
})
export class RecentEarningsComponent {

    selectedTimeframe: string = 'This Week'; // Default dropdown text
    chartData: { [key: string]: { series: { name: string; data: number[] }[]; categories: string[] } };

    constructor(
        private recentEarningsService: RecentEarningsService
    ) {
        // Define data for each timeframe
        this.chartData = {
            'This Day': {
                series: [
                    { name: "Gross Earnings", data: [5] },
                    { name: "Tax Withheld", data: [1] },
                    { name: "Net Earnings", data: [4] }
                ],
                categories: ['12 PM']
            },
            'This Week': {
                series: [
                    { name: "Gross Earnings", data: [44, 60, 41, 67, 22, 43, 41] },
                    { name: "Tax Withheld", data: [13, 30, 20, 8, 13, 27, 20] },
                    { name: "Net Earnings", data: [11, 20, 15, 15, 21, 14, 20] }
                ],
                categories: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
            },
            'This Month': {
                series: [
                    { name: "Gross Earnings", data: [140, 160, 190, 120] },
                    { name: "Tax Withheld", data: [40, 50, 60, 30] },
                    { name: "Net Earnings", data: [100, 110, 130, 90] }
                ],
                categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
            },
            'This Year': {
                series: [
                    { name: "Gross Earnings", data: [500, 800, 600, 700] },
                    { name: "Tax Withheld", data: [150, 200, 180, 140] },
                    { name: "Net Earnings", data: [350, 600, 420, 560] }
                ],
                categories: ['Q1', 'Q2', 'Q3', 'Q4']
            }
        };
    }

    ngOnInit(): void {
        // Load default chart
        const defaultData = this.chartData[this.selectedTimeframe];
        this.recentEarningsService.loadChart(defaultData.series, defaultData.categories);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe; // Update dropdown text
        const selectedData = this.chartData[timeframe];
        this.recentEarningsService.updateChartData(selectedData.series, selectedData.categories);
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