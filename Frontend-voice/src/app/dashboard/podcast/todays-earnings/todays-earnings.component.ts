import { Component, HostListener } from '@angular/core';
import { TodaysEarningsService } from './todays-earnings.service';

@Component({
    selector: 'app-todays-earnings',
    imports: [],
    templateUrl: './todays-earnings.component.html',
    styleUrl: './todays-earnings.component.scss'
})
export class TodaysEarningsComponent {

    selectedTimeframe: string = 'This Year'; // Default dropdown selection
    chartData: { [key: string]: { series: { name: string; data: number[] }[]; categories: string[] } };

    constructor(
        private todaysEarningsService: TodaysEarningsService
    ) {
        this.chartData = {
            'This Day': {
                series: [{ name: "Earnings", data: [10, 20, 15, 25, 30] }],
                categories: ["6 AM", "9 AM", "12 PM", "3 PM", "6 PM"]
            },
            'This Week': {
                series: [{ name: "Earnings", data: [50, 60, 70, 80, 90, 100, 110] }],
                categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            },
            'This Month': {
                series: [{ name: "Earnings", data: [200, 300, 250, 400] }],
                categories: ["Week 1", "Week 2", "Week 3", "Week 4"]
            },
            'This Year': {
                series: [{ name: "Earnings", data: [100, 130, 115, 170, 110, 120, 160, 100, 200, 105, 130, 100] }],
                categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            }
        };
    }

    ngOnInit(): void {
        const defaultData = this.chartData[this.selectedTimeframe];
        this.todaysEarningsService.loadChart(defaultData.series, defaultData.categories);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe;
        const selectedData = this.chartData[timeframe];
        this.todaysEarningsService.updateChart(selectedData.series, selectedData.categories);
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