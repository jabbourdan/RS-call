import { Component, HostListener } from '@angular/core';
import { ProjectsProgressService } from './projects-progress.service';

@Component({
    selector: 'app-projects-progress',
    imports: [],
    templateUrl: './projects-progress.component.html',
    styleUrl: './projects-progress.component.scss'
})
export class ProjectsProgressComponent {

    selectedTimeframe: string = 'Last 6 Months'; // Default dropdown text
    chartData: { [key: string]: { series: { name: string; data: number[] }[]; categories: string[] } };

    constructor(
        private projectsProgressService: ProjectsProgressService
    ) {
        // Define the data for each timeframe
        this.chartData = {
            'Last 2 Months': {
                series: [
                    { name: 'Completed', data: [70, 23] },
                    { name: 'In Progress', data: [15, 40] },
                    { name: 'Not Start Yet', data: [50, 11] },
                    { name: 'Cancelled', data: [30, 60] }
                ],
                categories: ['Jan', 'Feb']
            },
            'Last 4 Months': {
                series: [
                    { name: 'Completed', data: [70, 23, 45, 30] },
                    { name: 'In Progress', data: [15, 40, 37, 38] },
                    { name: 'Not Start Yet', data: [50, 11, 60, 15] },
                    { name: 'Cancelled', data: [30, 60, 25, 22] }
                ],
                categories: ['Jan', 'Feb', 'Mar', 'Apr']
            },
            'Last 6 Months': {
                series: [
                    { name: 'Completed', data: [70, 23, 45, 30, 62, 70] },
                    { name: 'In Progress', data: [15, 40, 37, 38, 80, 45] },
                    { name: 'Not Start Yet', data: [50, 11, 60, 15, 31, 30] },
                    { name: 'Cancelled', data: [30, 60, 25, 22, 50, 15] }
                ],
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
            },
            'Last 8 Months': {
                series: [
                    { name: 'Completed', data: [70, 23, 45, 30, 62, 70, 85, 90] },
                    { name: 'In Progress', data: [15, 40, 37, 38, 80, 45, 55, 50] },
                    { name: 'Not Start Yet', data: [50, 11, 60, 15, 31, 30, 40, 45] },
                    { name: 'Cancelled', data: [30, 60, 25, 22, 50, 15, 20, 25] }
                ],
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
            },
            'Last 10 Months': {
                series: [
                    { name: 'Completed', data: [70, 23, 45, 30, 62, 70, 85, 90, 95, 100] },
                    { name: 'In Progress', data: [15, 40, 37, 38, 80, 45, 55, 50, 45, 40] },
                    { name: 'Not Start Yet', data: [50, 11, 60, 15, 31, 30, 40, 45, 50, 55] },
                    { name: 'Cancelled', data: [30, 60, 25, 22, 50, 15, 20, 25, 30, 35] }
                ],
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']
            },
            'Last 12 Months': {
                series: [
                    { name: 'Completed', data: [70, 23, 45, 30, 62, 70, 85, 90, 95, 100, 105, 110] },
                    { name: 'In Progress', data: [15, 40, 37, 38, 80, 45, 55, 50, 45, 40, 35, 30] },
                    { name: 'Not Start Yet', data: [50, 11, 60, 15, 31, 30, 40, 45, 50, 55, 60, 65] },
                    { name: 'Cancelled', data: [30, 60, 25, 22, 50, 15, 20, 25, 30, 35, 40, 45] }
                ],
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            }
        };
    }

    ngOnInit(): void {
        // Load the default chart
        const defaultData = this.chartData[this.selectedTimeframe];
        this.projectsProgressService.loadChart(defaultData.series, defaultData.categories);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe; // Update button text
        const selectedData = this.chartData[timeframe];
        this.projectsProgressService.updateChart(selectedData.series, selectedData.categories);
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