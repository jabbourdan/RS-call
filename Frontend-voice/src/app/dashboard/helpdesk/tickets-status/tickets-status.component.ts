import { Component, HostListener } from '@angular/core';
import { TicketsStatusService } from './tickets-status.service';

@Component({
    selector: 'app-tickets-status',
    imports: [],
    templateUrl: './tickets-status.component.html',
    styleUrl: './tickets-status.component.scss'
})
export class TicketsStatusComponent {

    selectedTimeframe: string = 'This Week';
    chartData: { [key: string]: { series: { name: string; data: number[] }[]; categories: string[] } };

    constructor(
        private ticketsStatusService: TicketsStatusService
    ) {
        this.chartData = {
            'This Day': {
                series: [
                    { name: "Solved", data: [10, 20, 15, 30, 25] },
                    { name: "In Progress", data: [5, 10, 20, 10, 15] },
                    { name: "Pending", data: [2, 8, 15, 5, 10] },
                    { name: "Others", data: [1, 5, 10, 8, 6] }
                ],
                categories: ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM']
            },
            'This Week': {
                series: [
                    { name: "Solved", data: [28, 50, 90, 95, 20, 70, 35] },
                    { name: "In Progress", data: [80, 60, 70, 30, 45, 20, 80] },
                    { name: "Pending", data: [32, 23, 78, 35, 65, 35, 15] },
                    { name: "Others", data: [60, 25, 80, 25, 15, 40, 15] }
                ],
                categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            },
            'This Month': {
                series: [
                    { name: "Solved", data: [100, 120, 150, 180] },
                    { name: "In Progress", data: [60, 80, 110, 130] },
                    { name: "Pending", data: [30, 50, 70, 90] },
                    { name: "Others", data: [15, 25, 35, 45] }
                ],
                categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
            },
            'This Year': {
                series: [
                    { name: "Solved", data: [300, 400, 350, 450] },
                    { name: "In Progress", data: [200, 300, 250, 350] },
                    { name: "Pending", data: [100, 150, 130, 170] },
                    { name: "Others", data: [50, 75, 65, 85] }
                ],
                categories: ['Q1', 'Q2', 'Q3', 'Q4']
            }
        };
    }

    ngOnInit(): void {
        const defaultData = this.chartData[this.selectedTimeframe];
        this.ticketsStatusService.loadChart(defaultData.series, defaultData.categories);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe;
        const selectedData = this.chartData[timeframe];
        this.ticketsStatusService.updateChart(selectedData.series, selectedData.categories);
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