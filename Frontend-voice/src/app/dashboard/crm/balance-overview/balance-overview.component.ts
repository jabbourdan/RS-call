import { Component, HostListener } from '@angular/core';
import { BalanceOverviewService } from './balance-overview.service';

@Component({
    selector: 'app-balance-overview',
    imports: [],
    templateUrl: './balance-overview.component.html',
    styleUrl: './balance-overview.component.scss'
})
export class BalanceOverviewComponent {

    selectedTimeframe: string = 'Current Year'; // Default dropdown text
    chartData: { [key: string]: { series: any[]; categories: string[] } };

    constructor(
        private balanceOverviewService: BalanceOverviewService
    ) {
        // Define the data for each timeframe
        this.chartData = {
            'Current Week': {
                series: [
                    { name: 'Revenue', data: [5, 12, 20, 23, 25, 30, 35] },
                    { name: 'Expenses', data: [10, 15, 25, 30, 28, 35, 40] }
                ],
                categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            'Current Month': {
                series: [
                    { name: 'Revenue', data: [5, 12, 20, 23] },
                    { name: 'Expenses', data: [15, 20, 30, 30] }
                ],
                categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
            },
            'Current Year': {
                series: [
                    { name: 'Revenue', data: [5, 12, 20, 23, 25, 30, 40, 45, 50, 70, 65, 80] },
                    { name: 'Expenses', data: [15, 20, 30, 30, 35, 45, 60, 70, 80, 85, 95, 120] }
                ],
                categories: [
                    'Jan',
                    'Feb',
                    'Mar',
                    'Apr',
                    'May',
                    'Jun',
                    'Jul',
                    'Aug',
                    'Sep',
                    'Oct',
                    'Nov',
                    'Dec'
                ]
            }
        };
    }

    ngOnInit(): void {
        // Load the default chart
        const defaultData = this.chartData[this.selectedTimeframe];
        this.balanceOverviewService.loadChart(defaultData.series, defaultData.categories);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe; // Update button text
        const selectedData = this.chartData[timeframe];
        this.balanceOverviewService.updateChart(selectedData.series, selectedData.categories);
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