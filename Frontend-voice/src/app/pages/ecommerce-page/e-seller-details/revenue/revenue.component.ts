import { Component, HostListener } from '@angular/core';
import { RevenueService } from './revenue.service';

@Component({
    selector: 'app-revenue',
    imports: [],
    templateUrl: './revenue.component.html',
    styleUrl: './revenue.component.scss'
})
export class RevenueComponent {

    chartData: { [key: string]: { series: { name: string; data: number[] }[]; categories: string[] } };
    selectedTimeframe: string = 'This Week'; // Default timeframe

    constructor(
        private revenueService: RevenueService
    ) {
        this.chartData = {
            'This Day': {
                series: [
                    { name: 'Orders', data: [20, 15, 10] },
                    { name: 'Earnings', data: [50, 40, 30] },
                    { name: 'Refunds', data: [10, 5, 2] },
                    { name: 'Conversion Rate', data: [15, 10, 8] }
                ],
                categories: ['6 AM', '12 PM', '6 PM']
            },
            'This Week': {
                series: [
                    { name: 'Orders', data: [28, 50, 90, 95, 20, 70, 35] },
                    { name: 'Earnings', data: [80, 60, 70, 30, 45, 20, 80] },
                    { name: 'Refunds', data: [32, 23, 78, 35, 65, 35, 15] },
                    { name: 'Conversion Rate', data: [60, 25, 80, 25, 15, 40, 15] }
                ],
                categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            'This Month': {
                series: [
                    { name: 'Orders', data: [100, 200, 300, 400] },
                    { name: 'Earnings', data: [150, 250, 350, 450] },
                    { name: 'Refunds', data: [50, 100, 150, 200] },
                    { name: 'Conversion Rate', data: [20, 40, 60, 80] }
                ],
                categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
            },
            'This Year': {
                series: [
                    { name: 'Orders', data: [500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600] },
                    { name: 'Earnings', data: [550, 650, 750, 850, 950, 1050, 1150, 1250, 1350, 1450, 1550, 1650] },
                    { name: 'Refunds', data: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200] },
                    { name: 'Conversion Rate', data: [50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600] }
                ],
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            }
        };
    }

    ngOnInit(): void {
        // Load default chart
        const defaultData = this.chartData[this.selectedTimeframe];
        this.revenueService.loadChart(defaultData.series, defaultData.categories);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe; // Update button text
        const selectedData = this.chartData[timeframe];
        this.revenueService.updateChart(selectedData.series, selectedData.categories);
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