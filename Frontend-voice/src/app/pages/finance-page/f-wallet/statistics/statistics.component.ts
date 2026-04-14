import { Component, HostListener } from '@angular/core';
import { StatisticsService } from './statistics.service';

@Component({
    selector: 'app-statistics',
    imports: [],
    templateUrl: './statistics.component.html',
    styleUrl: './statistics.component.scss'
})
export class StatisticsComponent {

    selectedTimeframe: string = 'Monthly'; // Default dropdown text
    chartData: { [key: string]: { series: any[]; categories: string[] } };

    constructor(
        private statisticsService: StatisticsService
    ) {
        this.chartData = {
            Weekly: {
                series: [
                    { name: 'Income', data: [100, 120, 140, 160, 180, 200, 220] },
                    { name: 'Expenses', data: [150, 170, 190, 210, 230, 250, 270] }
                ],
                categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            Monthly: {
                series: [
                    { name: 'Income', data: [450, 540, 560, 540, 600, 570, 630, 600, 660, 450, 540, 560] },
                    { name: 'Expenses', data: [760, 850, 1000, 970, 850, 1050, 900, 1130, 950, 760, 850, 1000] }
                ],
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            },
            Yearly: {
                series: [
                    { name: 'Income', data: [5400, 5600, 6000, 6200, 5800, 6500, 7000] },
                    { name: 'Expenses', data: [8500, 9200, 9000, 8800, 8900, 9100, 9500] }
                ],
                categories: ['2017', '2018', '2019', '2020', '2021', '2022', '2023']
            }
        };
    }

    ngOnInit(): void {
        const defaultData = this.chartData[this.selectedTimeframe];
        this.statisticsService.loadChart(defaultData.series, defaultData.categories);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe; // Update the button text
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