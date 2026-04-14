import { Component, HostListener } from '@angular/core';
import { EmployeeWorkFormatService } from './employee-work-format.service';

@Component({
    selector: 'app-employee-work-format',
    imports: [],
    templateUrl: './employee-work-format.component.html',
    styleUrl: './employee-work-format.component.scss'
})
export class EmployeeWorkFormatComponent {
    
    constructor(
        private employeeWorkFormatService: EmployeeWorkFormatService
    ) {}

    ngOnInit(): void {
        this.loadChart([120, 160, 50, 20]); // Default data for "This Month"
    }

    onTimeframeChange(timeframe: string): void {
        // Define data for different timeframes
        let data: number[] = [];
        switch (timeframe) {
            case 'This Day':
            data = [10, 15, 5, 2]; // Example data for "This Day"
            break;
            case 'This Week':
            data = [40, 50, 20, 10]; // Example data for "This Week"
            break;
            case 'This Month':
            data = [120, 160, 50, 20]; // Example data for "This Month"
            break;
            case 'This Year':
            data = [500, 600, 300, 100]; // Example data for "This Year"
            break;
        }
        this.loadChart(data); // Reload the chart with new data
    }

    loadChart(data: number[]): void {
        this.employeeWorkFormatService.loadChart(data); // Pass data to the service
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