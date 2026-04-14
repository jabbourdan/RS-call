import { Component, HostListener } from '@angular/core';
import { PerformanceMetricsService } from './performance-metrics.service';

@Component({
    selector: 'app-performance-metrics',
    imports: [],
    templateUrl: './performance-metrics.component.html',
    styleUrl: './performance-metrics.component.scss'
})
export class PerformanceMetricsComponent {

    selectedTimeframe: string = 'Monthly'; // Default selection set to Monthly
    chartData: { [key: string]: { series: { name: string; data: number[] }[], categories: string[] } };

    constructor(
        private performanceMetricsService: PerformanceMetricsService
    ) {
        this.chartData = {
            'Daily': {
                series: [
                    { name: "Revenue", data: [50, 60, 70, 80, 110, 100] },
                    { name: "Expenses", data: [10, 20, 30, 40, 50, 60] },
                    { name: "Profit", data: [0, 5, 10, 15, 20, 25] }
                ],
                categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            },
            'Weekly': {
                series: [
                    { name: "Revenue", data: [60, 70, 80, 90, 100] },
                    { name: "Expenses", data: [20, 30, 40, 50, 60] },
                    { name: "Profit", data: [5, 10, 15, 20, 25] }
                ],
                categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5']
            },
            'Monthly': {
                series: [
                    { name: "Revenue", data: [120, 130, 140, 155, 165, 175, 185, 190, 200, 205, 200, 225] },
                    { name: "Expenses", data: [10, 20, 30, 40, 50, 60, 70, 70, 90, 100, 110, 90] },
                    { name: "Profit", data: [0, 5, 10, 15, 20, 25, 30, 35, 25, 45, 50, 55] }
                ],
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            },
            'Yearly': {
                series: [
                    { name: "Revenue", data: [600, 700, 800, 900] },
                    { name: "Expenses", data: [200, 300, 400, 500] },
                    { name: "Profit", data: [50, 100, 150, 200] }
                ],
                categories: ['2020', '2021', '2022', '2023']
            }
        };
    }

    ngOnInit(): void {
        const defaultData = this.chartData[this.selectedTimeframe];
        this.performanceMetricsService.loadChart(defaultData.series, defaultData.categories);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe;
        const selectedData = this.chartData[timeframe];
        this.performanceMetricsService.updateChart(selectedData.series, selectedData.categories);
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