import { Component, HostListener } from '@angular/core';
import { AttendanceAnalyticsService } from './attendance-analytics.service';

@Component({
    selector: 'app-attendance-analytics',
    imports: [],
    templateUrl: './attendance-analytics.component.html',
    styleUrl: './attendance-analytics.component.scss'
})
export class AttendanceAnalyticsComponent {

    constructor(
        private attendanceAnalyticsService: AttendanceAnalyticsService
    ) {}

    ngOnInit(): void {
        this.loadChart('This Year'); // Load initial chart with default data
    }

    selectedTimeframe: string = 'This Year'; // Default dropdown text

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe; // Update the dropdown button text
        this.loadChart(timeframe); // Load chart data based on the selected timeframe
    }

    loadChart(timeframe: string): void {
        // Define data for different timeframes
        const chartData: { [key: string]: any } = {
            'This Day': {
                series: [
                    { name: 'Teachers', data: [10, 15, 20] },
                    { name: 'Boys', data: [5, 10, 15] },
                    { name: 'Girls', data: [8, 12, 10] }
                ],
                categories: ['Morning', 'Afternoon', 'Evening']
            },
            'This Week': {
                series: [
                    { name: 'Teachers', data: [50, 60, 70, 80, 90, 100, 110] },
                    { name: 'Boys', data: [30, 40, 50, 60, 70, 80, 90] },
                    { name: 'Girls', data: [20, 30, 40, 50, 60, 70, 80] }
                ],
                categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            'This Month': {
                series: [
                    { name: 'Teachers', data: [200, 250, 300, 350] },
                    { name: 'Boys', data: [100, 150, 200, 250] },
                    { name: 'Girls', data: [80, 100, 150, 180] }
                ],
                categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
            },
            'This Year': {
                series: [
                    {
                        name: 'Teachers',
                        data: [500, 600, 250, 600, 200, 500, 600, 120, 250, 500, 200, 250]
                    },
                    {
                        name: 'Boys',
                        data: [200, 300, 200, 400, 200, 250, 350, 120, 250, 300, 120, 200]
                    },
                    {
                        name: 'Girls',
                        data: [150, 250, 200, 300, 300, 150, 200, 300, 200, 250, 400, 200]
                    }
                ],
                categories: [
                    'Jan',
                    'Feb',
                    'Mar',
                    'Apr',
                    'May',
                    'Jun',
                    'Jul',
                    'Aug',
                    'Sep',
                    'Oct',
                    'Nov',
                    'Dec'
                ]
            }
        };

        // Load chart with selected timeframe data
        const selectedData = chartData[timeframe];
        this.attendanceAnalyticsService.loadChart(
            selectedData.series,
            selectedData.categories
        );
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