import { Component, HostListener } from '@angular/core';
import { ReturningCustomerRateService } from './returning-customer-rate.service';

@Component({
    selector: 'app-returning-customer-rate',
    imports: [],
    templateUrl: './returning-customer-rate.component.html',
    styleUrl: './returning-customer-rate.component.scss'
})
export class ReturningCustomerRateComponent {

    selectedTimeframe: string = 'This Year'; // Default dropdown text
    chartData: { [key: string]: { series: { name: string; data: number[] }[]; categories: string[] } };

    constructor(
        private returningCustomerRateService: ReturningCustomerRateService
    ) {
        // Define the data for each timeframe
        this.chartData = {
            'This Day': {
                series: [
                    { name: 'Fifth Time', data: [10, 20, 30, 40, 50] },
                    { name: 'Fourth Time', data: [5, 15, 25, 35, 45] }
                ],
                categories: ['6 AM', '9 AM', '12 PM', '3 PM', '6 PM']
            },
            'This Week': {
                series: [
                    { name: 'Fifth Time', data: [15, 25, 35, 45, 55, 65, 75] },
                    { name: 'Fourth Time', data: [10, 20, 30, 40, 50, 60, 70] }
                ],
                categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            'This Month': {
                series: [
                    { name: 'Fifth Time', data: [40, 50, 60, 70] },
                    { name: 'Fourth Time', data: [30, 40, 50, 60] }
                ],
                categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
            },
            'This Year': {
                series: [
                    { name: 'Fifth Time', data: [70, 23, 40, 30, 62, 52, 90, 20, 60, 53, 45, 63] },
                    { name: 'Fourth Time', data: [15, 58, 45, 38, 70, 50, 55, 60, 78, 40, 35, 50] }
                ],
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            }
        };
    }

    ngOnInit(): void {
        // Load the default chart
        const defaultData = this.chartData[this.selectedTimeframe];
        this.returningCustomerRateService.loadChart(defaultData.series, defaultData.categories);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe; // Update button text
        const selectedData = this.chartData[timeframe];
        this.returningCustomerRateService.updateChart(selectedData.series, selectedData.categories);
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