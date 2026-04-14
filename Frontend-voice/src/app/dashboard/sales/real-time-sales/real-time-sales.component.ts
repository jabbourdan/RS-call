import { Component, HostListener } from '@angular/core';
import { RealTimeSalesService } from './real-time-sales.service';

@Component({
    selector: 'app-real-time-sales',
    imports: [],
    templateUrl: './real-time-sales.component.html',
    styleUrl: './real-time-sales.component.scss'
})
export class RealTimeSalesComponent {

    selectedTimeframe: string = 'This Week'; // Default dropdown text
    chartData: { [key: string]: { series: { name: string; data: number[] }[]; categories: string[] } };

    constructor(
        private realTimeSalesService: RealTimeSalesService
    ) {
        // Define data for each timeframe
        this.chartData = {
            'This Day': {
                series: [{ name: "Sales", data: [5, 10, 15, 20, 25, 30, 35, 40] }],
                categories: ["1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM", "8 AM"]
            },
            'This Week': {
                series: [{ name: "Sales", data: [2.3, 3.1, 4.0, 10.1, 4.0, 3.6, 3.2, 2.3] }],
                categories: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            },
            'This Month': {
                series: [{ name: "Sales", data: [10, 20, 30, 60, 70, 80, 40, 50] }],
                categories: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8"]
            },
            'This Year': {
                series: [{ name: "Sales", data: [100, 200, 150, 250, 300, 200, 100, 150] }],
                categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"]
            }
        };
    }

    ngOnInit(): void {
        // Load the default chart
        const defaultData = this.chartData[this.selectedTimeframe];
        this.realTimeSalesService.loadChart(defaultData.series, defaultData.categories);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe; // Update button text
        const selectedData = this.chartData[timeframe];
        this.realTimeSalesService.updateChartData(selectedData.series, selectedData.categories);
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