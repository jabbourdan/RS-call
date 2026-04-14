import { Component, HostListener } from '@angular/core';
import { GuestActivityService } from './guest-activity.service';

@Component({
    selector: 'app-guest-activity',
    imports: [],
    templateUrl: './guest-activity.component.html',
    styleUrl: './guest-activity.component.scss'
})
export class GuestActivityComponent {

    selectedTimeframe: string = 'Daily';  // Default selection
    chartData: { [key: string]: { series: any[], categories: string[] } };

    constructor(
        private guestActivityService: GuestActivityService
    ) {
        this.chartData = {
            'Daily': {
                series: [
                    { name: 'Check In', data: [15, 30, 20, 40, 35, 30, 25] },
                    { name: 'Check Out', data: [10, 20, 15, 25, 30, 40, 30] }
                ],
                categories: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00']
            },
            'Weekly': {
                series: [
                    { name: 'Check In', data: [100, 130, 120, 140] },
                    { name: 'Check Out', data: [90, 100, 110, 120] }
                ],
                categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
            },
            'Monthly': {
                series: [
                    { name: 'Check In', data: [400, 350, 450, 500, 600] },
                    { name: 'Check Out', data: [350, 400, 450, 460, 500] }
                ],
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May']
            },
            'Yearly': {
                series: [
                    { name: 'Check In', data: [1200, 1300, 1500] },
                    { name: 'Check Out', data: [1100, 1200, 1300] }
                ],
                categories: ['2021', '2022', '2023']
            }
        };
    }

    ngOnInit(): void {
        // Load the chart for the default timeframe (Daily)
        const defaultData = this.chartData[this.selectedTimeframe];
        this.guestActivityService.loadChart(defaultData.series, defaultData.categories);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe;
        const selectedData = this.chartData[timeframe];
        this.guestActivityService.updateChart(selectedData.series, selectedData.categories);
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