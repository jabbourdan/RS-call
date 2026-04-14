import { Component, HostListener } from '@angular/core';
import { NewTicketsSolvedTicketsService } from './new-tickets-solved-tickets.service';

@Component({
    selector: 'app-new-tickets-solved-tickets',
    imports: [],
    templateUrl: './new-tickets-solved-tickets.component.html',
    styleUrl: './new-tickets-solved-tickets.component.scss'
})
export class NewTicketsSolvedTicketsComponent {

    chartData: { [key: string]: { series: { name: string; data: number[] }[]; categories: string[] } };
    selectedTimeframe: string = 'Weekly'; // Default timeframe

    constructor(
        private newTicketsSolvedTicketsService: NewTicketsSolvedTicketsService
    ) {
        this.chartData = {
            'Daily': {
                series: [
                    { name: 'New Tickets', data: [10, 15, 20, 25, 30] },
                    { name: 'Solved Tickets', data: [5, 10, 15, 20, 25] }
                ],
                categories: ['6 AM', '9 AM', '12 PM', '3 PM', '6 PM']
            },
            'Weekly': {
                series: [
                    { name: 'New Tickets', data: [25, 70, 25, 45, 60, 55, 70] },
                    { name: 'Solved Tickets', data: [65, 45, 65, 30, 75, 24, 50] }
                ],
                categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            'Monthly': {
                series: [
                    { name: 'New Tickets', data: [100, 200, 150, 250] },
                    { name: 'Solved Tickets', data: [80, 160, 120, 200] }
                ],
                categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
            },
            'Yearly': {
                series: [
                    { name: 'New Tickets', data: [300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400] },
                    { name: 'Solved Tickets', data: [280, 380, 480, 580, 680, 780, 880, 980, 1080, 1180, 1280, 1380] }
                ],
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            }
        };
    }

    ngOnInit(): void {
        // Load default chart
        const defaultData = this.chartData[this.selectedTimeframe];
        this.newTicketsSolvedTicketsService.loadChart(defaultData.series, defaultData.categories);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe; // Update button text
        const selectedData = this.chartData[timeframe];
        this.newTicketsSolvedTicketsService.updateChart(selectedData.series, selectedData.categories);
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