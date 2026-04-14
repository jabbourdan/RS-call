import { Component, HostListener } from '@angular/core';
import { NewTicketsSolvedTicketsService } from './new-tickets-solved-tickets.service';

@Component({
    selector: 'app-new-tickets-solved-tickets',
    imports: [],
    templateUrl: './new-tickets-solved-tickets.component.html',
    styleUrl: './new-tickets-solved-tickets.component.scss'
})
export class NewTicketsSolvedTicketsComponent {

    selectedTimeframe: string = 'Weekly'; // Default dropdown text
    chartData: { [key: string]: { series: any[]; categories: string[] } };

    constructor(
        private newTicketsSolvedTicketsService: NewTicketsSolvedTicketsService
    ) {
        this.chartData = {
            'Daily': {
                series: [
                    { name: "New Tickets", data: [5, 10, 15, 20, 25, 30, 35] },
                    { name: "Solved Tickets", data: [7, 14, 21, 28, 35, 42, 49] }
                ],
                categories: ["8 AM", "10 AM", "12 PM", "2 PM", "4 PM", "6 PM", "8 PM"]
            },
            'Weekly': {
                series: [
                    { name: "New Tickets", data: [25, 70, 25, 45, 60, 55, 70] },
                    { name: "Solved Tickets", data: [65, 45, 65, 30, 75, 24, 50] }
                ],
                categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            },
            'Monthly': {
                series: [
                    { name: "New Tickets", data: [200, 300, 250, 400] },
                    { name: "Solved Tickets", data: [150, 200, 180, 300] }
                ],
                categories: ["Week 1", "Week 2", "Week 3", "Week 4"]
            },
            'Yearly': {
                series: [
                    { name: "New Tickets", data: [1000, 2000, 1500, 2500] },
                    { name: "Solved Tickets", data: [800, 1200, 1100, 2000] }
                ],
                categories: ["Q1", "Q2", "Q3", "Q4"]
            }
        };
    }

    ngOnInit(): void {
        const defaultData = this.chartData[this.selectedTimeframe];
        this.newTicketsSolvedTicketsService.loadChart(defaultData.series, defaultData.categories);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe;
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