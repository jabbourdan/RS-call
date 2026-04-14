import { Component, HostListener } from '@angular/core';
import { SalesAnalyticsService } from './sales-analytics.service';
import { TopPerformingService } from './top-performing.service';

@Component({
    selector: 'app-sales-analytics',
    imports: [],
    templateUrl: './sales-analytics.component.html',
    styleUrl: './sales-analytics.component.scss'
})
export class SalesAnalyticsComponent {

    chartData: { [key: string]: { series: { name: string; data: number[] }[]; categories: string[] } };
    selectedTimeframe: string = 'This Week'; // Default timeframe

    constructor(
        private salesAnalyticsService: SalesAnalyticsService,
        private topPerformingService: TopPerformingService
    ) {
        this.chartData = {
            'This Day': {
                series: [{ name: "Sale", data: [10, 15, 20, 25, 30] }],
                categories: ["6 AM", "9 AM", "12 PM", "3 PM", "6 PM"]
            },
            'This Week': {
                series: [{ name: "Sale", data: [70, 60, 80, 100, 70, 40, 80] }],
                categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            'This Month': {
                series: [{ name: "Sale", data: [300, 400, 500, 600] }],
                categories: ["Week 1", "Week 2", "Week 3", "Week 4"]
            },
            'This Year': {
                series: [{ name: "Sale", data: [500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600] }],
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            }
        };
    }

    ngOnInit(): void {
        // Load default chart data
        const defaultData = this.chartData[this.selectedTimeframe];
        this.salesAnalyticsService.loadChart(defaultData.series, defaultData.categories);
        this.topPerformingService.loadChart();
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe; // Update timeframe
        const selectedData = this.chartData[timeframe];
        this.salesAnalyticsService.updateChart(selectedData.series, selectedData.categories);
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