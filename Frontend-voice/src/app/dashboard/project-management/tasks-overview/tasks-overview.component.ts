import { Component, HostListener } from '@angular/core';
import { TasksOverviewService } from './tasks-overview.service';

@Component({
    selector: 'app-tasks-overview',
    imports: [],
    templateUrl: './tasks-overview.component.html',
    styleUrl: './tasks-overview.component.scss'
})
export class TasksOverviewComponent {

    selectedTimeframe: string = 'Last Week'; // Default dropdown text
    chartData: { [key: string]: { series: number[]; labels: string[] } };

    constructor(
        private tasksOverviewService: TasksOverviewService
    ) {
        // Define the data for each timeframe
        this.chartData = {
            'Last Day': {
                series: [20, 15, 10, 5, 2],
                labels: ['Completed', 'In Progress', 'Pending', 'Active', 'Cancelled']
            },
            'Last Week': {
                series: [55, 44, 30, 12, 22],
                labels: ['Completed', 'In Progress', 'Pending', 'Active', 'Cancelled']
            },
            'Last Month': {
                series: [120, 100, 80, 50, 40],
                labels: ['Completed', 'In Progress', 'Pending', 'Active', 'Cancelled']
            },
            'Last Year': {
                series: [300, 200, 150, 100, 50],
                labels: ['Completed', 'In Progress', 'Pending', 'Active', 'Cancelled']
            }
        };
    }

    ngOnInit(): void {
        // Load the default chart
        const defaultData = this.chartData[this.selectedTimeframe];
        this.tasksOverviewService.loadChart(defaultData.series, defaultData.labels);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe; // Update button text
        const selectedData = this.chartData[timeframe];
        this.tasksOverviewService.updateChart(selectedData.series, selectedData.labels);
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