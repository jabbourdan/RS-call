import { Component, HostListener } from '@angular/core';
import { StudentsOverviewService } from './students-overview.service';

@Component({
    selector: 'app-students-overview',
    imports: [],
    templateUrl: './students-overview.component.html',
    styleUrl: './students-overview.component.scss'
})
export class StudentsOverviewComponent {

    constructor(
        private studentsOverviewService: StudentsOverviewService
    ) {}

    ngOnInit(): void {
        this.loadChart('Last Month'); // Load the initial chart with default data
    }

    selectedTimeframe: string = 'Last Month'; // Default dropdown text

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe; // Update dropdown button text
        this.loadChart(timeframe); // Load chart data based on selected timeframe
    }

    loadChart(timeframe: string): void {
        // Define data for different timeframes
        const chartData: { [key: string]: any } = {
        'Last Day': {
            series: [
                { name: 'Boys', data: [10, 20, 15] },
                { name: 'Girls', data: [-8, -18, -12] }
            ],
            categories: ['Morning', 'Afternoon', 'Evening']
        },
        'Last Week': {
            series: [
                { name: 'Boys', data: [50, 60, 70, 80, 90, 100, 110] },
                { name: 'Girls', data: [-40, -50, -60, -70, -80, -90, -100] }
            ],
            categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        'Last Month': {
            series: [
                { name: 'Boys', data: [70, 42, 70, 120, 40, 70, 90] },
                { name: 'Girls', data: [-70, -44, -70, -120, -40, -70, -90] }
            ],
            categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7']
        },
        'Last Year': {
            series: [
                { name: 'Boys', data: [300, 400, 350, 450, 400, 500, 550] },
                { name: 'Girls', data: [-250, -350, -300, -400, -350, -450, -500] }
            ],
            categories: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7']
        }
    };

        // Get data for the selected timeframe
        const selectedData = chartData[timeframe];
        this.studentsOverviewService.loadChart(
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