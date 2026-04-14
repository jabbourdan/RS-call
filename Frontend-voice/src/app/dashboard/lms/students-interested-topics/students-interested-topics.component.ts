import { Component, HostListener } from '@angular/core';
import { StudentsInterestedTopicsService } from './students-interested-topics.service';

@Component({
    selector: 'app-students-interested-topics',
    imports: [],
    templateUrl: './students-interested-topics.component.html',
    styleUrl: './students-interested-topics.component.scss'
})
export class StudentsInterestedTopicsComponent {

    selectedTimeframe: string = 'Last 6 Months'; // Default dropdown text
    chartData: { [key: string]: { series: { name: string; data: number[] }[]; categories: string[] } };

    constructor(
        private studentsInterestedTopicsService: StudentsInterestedTopicsService
    ) {
        // Define the data for each timeframe
        this.chartData = {
            'Last 2 Months': {
                series: [
                    { name: 'Courses', data: [10, 15, 8, 5, 7, 12] }
                ],
                categories: ['UX/UI Design', 'WordPress', 'Motion Design', 'Video Editing', 'Angular', 'Python']
            },
            'Last 4 Months': {
                series: [
                    { name: 'Courses', data: [20, 30, 18, 10, 14, 25] }
                ],
                categories: ['UX/UI Design', 'WordPress', 'Motion Design', 'Video Editing', 'Angular', 'Python']
            },
            'Last 6 Months': {
                series: [
                    { name: 'Courses', data: [47, 69, 37, 17, 28, 40] }
                ],
                categories: ['UX/UI Design', 'WordPress', 'Motion Design', 'Video Editing', 'Angular', 'Python']
            },
            'Last 8 Months': {
                series: [
                    { name: 'Courses', data: [55, 80, 50, 20, 35, 60] }
                ],
                categories: ['UX/UI Design', 'WordPress', 'Motion Design', 'Video Editing', 'Angular', 'Python']
            },
            'Last 10 Months': {
                series: [
                    { name: 'Courses', data: [65, 90, 60, 30, 50, 80] }
                ],
                categories: ['UX/UI Design', 'WordPress', 'Motion Design', 'Video Editing', 'Angular', 'Python']
            },
            'Last 12 Months': {
                series: [
                    { name: 'Courses', data: [80, 100, 70, 40, 60, 100] }
                ],
                categories: ['UX/UI Design', 'WordPress', 'Motion Design', 'Video Editing', 'Angular', 'Python']
            }
        };
    }

    ngOnInit(): void {
        // Load the default chart
        const defaultData = this.chartData[this.selectedTimeframe];
        this.studentsInterestedTopicsService.loadChart(defaultData.series, defaultData.categories);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe; // Update button text
        const selectedData = this.chartData[timeframe];
        this.studentsInterestedTopicsService.updateChart(selectedData.series, selectedData.categories);
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