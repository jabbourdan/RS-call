import { Component, HostListener } from '@angular/core';
import { SalesReportService } from './sales-report.service';

@Component({
    selector: 'app-sales-report',
    imports: [],
    templateUrl: './sales-report.component.html',
    styleUrl: './sales-report.component.scss'
})
export class SalesReportComponent {

    selectedTimeframe: string = 'This Week'; // Default dropdown text
    chartData: { [key: string]: { series: { name: string; data: number[] }[]; categories: string[] } };

    constructor(
        private salesReportService: SalesReportService
    ) {
        // Define the data for each timeframe
        this.chartData = {
            'This Day': {
                series: [
                    { name: 'Online', data: [10, 15, 20, 25, 30] },
                    { name: 'Offline', data: [5, 10, 15, 20, 25] }
                ],
                categories: ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM']
            },
            'This Week': {
                series: [
                    { name: 'Online', data: [45, 23, 62, 60, 110, 100, 135] },
                    { name: 'Offline', data: [20, 58, 24, 50, 40, 70, 97] }
                ],
                categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            'This Month': {
                series: [
                    { name: 'Online', data: [300, 450, 500, 600] },
                    { name: 'Offline', data: [200, 300, 400, 500] }
                ],
                categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
            },
            'This Year': {
                series: [
                    { name: 'Online', data: [2000, 3000, 2500, 4000] },
                    { name: 'Offline', data: [1500, 2000, 1800, 3000] }
                ],
                categories: ['Q1', 'Q2', 'Q3', 'Q4']
            }
        };
    }

    ngOnInit(): void {
        // Load the default chart
        const defaultData = this.chartData[this.selectedTimeframe];
        this.salesReportService.loadChart(defaultData.series, defaultData.categories);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe; // Update button text
        const selectedData = this.chartData[timeframe];
        this.salesReportService.updateChart(selectedData.series, selectedData.categories);
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