import { Component, HostListener } from '@angular/core';
import { NewAdmissionsService } from './new-admissions.service';

@Component({
    selector: 'app-new-admissions',
    imports: [],
    templateUrl: './new-admissions.component.html',
    styleUrl: './new-admissions.component.scss'
})
export class NewAdmissionsComponent {

    constructor(
        private newAdmissionsService: NewAdmissionsService
    ) {}

    ngOnInit(): void {
        this.loadChart('This Month'); // Load the initial chart with default data
    }

    onTimeframeChange(timeframe: string): void {
        this.loadChart(timeframe); // Load chart data based on the selected timeframe
    }

    loadChart(timeframe: string): void {
        // Define data for different timeframes
        const chartData: { [key: string]: number[] } = {
            'This Day': [10, 20, 15, 30, 25], // Example data for "This Day"
            'This Week': [50, 100, 75, 150, 125], // Example data for "This Week"
            'This Month': [45, 220, 180, 375, 455], // Example data for "This Month"
            'This Year': [500, 1200, 900, 1500, 1800] // Example data for "This Year"
        };
        // Get data for the selected timeframe
        const data = chartData[timeframe];
        this.newAdmissionsService.loadChart(data); // Pass data to the service
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