import { Component, HostListener } from '@angular/core';
import { InstagramSubscribersService } from './instagram-subscribers.service';

@Component({
    selector: 'app-instagram-subscribers',
    imports: [],
    templateUrl: './instagram-subscribers.component.html',
    styleUrl: './instagram-subscribers.component.scss'
})
export class InstagramSubscribersComponent {

    selectedTimeframe: string = 'This Year'; // Default timeframe
    chartData: { [key: string]: { series: { name: string; data: number[] }[]; categories: string[] } };

    constructor(
        private instagramSubscribersService: InstagramSubscribersService
    ) {
        this.chartData = {
            'This Day': {
                series: [
                    { name: "Gained", data: [10, 20, 15, 30] },
                    { name: "Lost", data: [-5, -10, -8, -15] }
                ],
                categories: ["6 AM", "9 AM", "12 PM", "3 PM"]
            },
            'This Week': {
                series: [
                    { name: "Gained", data: [70, 42, 70, 120, 40, 70, 90] },
                    { name: "Lost", data: [-70, -44, -70, -120, -40, -70, -90] }
                ],
                categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            },
            'This Month': {
                series: [
                    { name: "Gained", data: [70, 42, 70, 120] },
                    { name: "Lost", data: [-70, -44, -70, -120] }
                ],
                categories: ["Week 1", "Week 2", "Week 3", "Week 4"]
            },
            'This Year': {
                series: [
                    { name: "Gained", data: [70, 42, 70, 120, 40, 70, 90, 70, 25, 70, 120, 40] },
                    { name: "Lost", data: [-70, -44, -70, -120, -40, -70, -120, -70, -30, -70, -80, -40] }
                ],
                categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            }
        };
    }

    ngOnInit(): void {
        const defaultData = this.chartData[this.selectedTimeframe];
        this.instagramSubscribersService.loadChart(defaultData.series, defaultData.categories);
    }

    onTimeframeChange(timeframe: string): void {
        const selectedData = this.chartData[timeframe];
        this.instagramSubscribersService.updateChart(selectedData.series, selectedData.categories);
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