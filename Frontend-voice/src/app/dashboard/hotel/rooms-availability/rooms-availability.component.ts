import { Component, HostListener } from '@angular/core';
import { RoomsAvailabilityService } from './rooms-availability.service';

@Component({
    selector: 'app-rooms-availability',
    imports: [],
    templateUrl: './rooms-availability.component.html',
    styleUrl: './rooms-availability.component.scss'
})
export class RoomsAvailabilityComponent {

    selectedTimeframe: string = 'Daily';  // Default selection
    chartData: { [key: string]: { percentage: number } };
    
    constructor(
        private roomsAvailabilityService: RoomsAvailabilityService
    ) {
        this.chartData = {
            'Daily': { percentage: 72.5 },  // Example value for Daily
            'Weekly': { percentage: 30.7 },  // Example value for Weekly
            'Monthly': { percentage: 60.3 },  // Example value for Monthly
            'Yearly': { percentage: 55 }  // Example value for Yearly
        };
    }

    ngOnInit(): void {
        // Load the initial chart with the default timeframe (Monthly)
        const defaultPercentage = this.chartData[this.selectedTimeframe].percentage;
        this.roomsAvailabilityService.loadChart(defaultPercentage);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe;
        const selectedPercentage = this.chartData[timeframe].percentage;
        this.roomsAvailabilityService.updateChart(selectedPercentage);
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