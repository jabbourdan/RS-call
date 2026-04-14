import { Component, HostListener } from '@angular/core';
import { ResponseTimeService } from './response-time.service';

@Component({
    selector: 'app-response-time',
    imports: [],
    templateUrl: './response-time.component.html',
    styleUrl: './response-time.component.scss'
})
export class ResponseTimeComponent {

    selectedTimeframe: string = 'This Year';
    chartData: { [key: string]: { series: number[]; categories: string[] } };

    constructor(
        private responseTimeService: ResponseTimeService
    ) {
        this.chartData = {
            'This Day': {
                series: [15, 20, 25, 30, 35, 40, 45],
                categories: ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM']
            },
            'This Week': {
                series: [100, 130, 115, 170, 110, 120, 85],
                categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            'This Month': {
                series: [400, 500, 300, 450],
                categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
            },
            'This Year': {
                series: [100, 130, 115, 170, 110, 120, 85, 140, 150, 100, 110, 90],
                categories: [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec"
                ]
            }
        };
    }

    ngOnInit(): void {
        const defaultData = this.chartData[this.selectedTimeframe];
        this.responseTimeService.loadChart(defaultData.series, defaultData.categories);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe;
        const selectedData = this.chartData[timeframe];
        this.responseTimeService.updateChart(selectedData.series, selectedData.categories);
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