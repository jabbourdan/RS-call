import { Component, HostListener } from '@angular/core';
import { StatisticsService } from './statistics.service';

@Component({
    selector: 'app-statistics',
    imports: [],
    templateUrl: './statistics.component.html',
    styleUrl: './statistics.component.scss'
})
export class StatisticsComponent {

    selectedTimeframe: string = 'Daily'; // Default selection set to Daily
    chartData: { [key: string]: { series: { name: string; data: number[] }[], categories: string[] } };

    constructor(
        private statisticsService: StatisticsService
    ) {
        this.chartData = {
            'Daily': {
                series: [
                    { name: "Income", data: [35, 45, 55, 35, 65, 38, 63] },
                    { name: "Expense", data: [25, 15, 45, 25, 15, 20, 25] }
                ],
                categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            'Weekly': {
                series: [
                    { name: "Income", data: [250, 450, 350, 500] },
                    { name: "Expense", data: [200, 300, 250, 350] }
                ],
                categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
            },
            'Monthly': {
                series: [
                    { name: "Income", data: [1300, 1500, 1600, 1700] },
                    { name: "Expense", data: [1200, 1300, 1400, 1500] }
                ],
                categories: ['Jan', 'Feb', 'Mar', 'Apr']
            },
            'Yearly': {
                series: [
                    { name: "Income", data: [12000, 13500, 14000, 14500] },
                    { name: "Expense", data: [10000, 11000, 11500, 12000] }
                ],
                categories: ['2022', '2023', '2024', '2025']
            }
        };
    }

    ngOnInit(): void {
        const defaultData = this.chartData[this.selectedTimeframe];
        this.statisticsService.loadChart(defaultData.series, defaultData.categories);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe;
        const selectedData = this.chartData[timeframe];
        this.statisticsService.updateChart(selectedData.series, selectedData.categories);
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