import { Component, HostListener } from '@angular/core';
import { EmergencyRoomVisitsService } from './emergency-room-visits.service';

@Component({
    selector: 'app-emergency-room-visits',
    imports: [],
    templateUrl: './emergency-room-visits.component.html',
    styleUrl: './emergency-room-visits.component.scss'
})
export class EmergencyRoomVisitsComponent {

    selectedTimeframe: string = 'Last Day';
    chartData: { [key: string]: any[] };

    constructor(
        private emergencyRoomVisitsService: EmergencyRoomVisitsService
    ) {
        // Define data for each timeframe
        this.chartData = {
            'Last Day': this.generateSeries(14, { min: 0, max: 90 }),
            'Last Week': this.generateSeries(7, { min: 0, max: 120 }),
            'Last Month': this.generateSeries(30, { min: 0, max: 150 }),
            'Last Year': this.generateSeries(12, { min: 0, max: 200 })
        };
    }

    ngOnInit(): void {
        // Load the default chart
        this.emergencyRoomVisitsService.loadChart(this.chartData[this.selectedTimeframe]);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe; // Update the button text
        this.emergencyRoomVisitsService.updateChartData(this.chartData[timeframe]);
    }

    generateSeries(count: number, yrange: { min: number, max: number }): any[] {
        return Array.from({ length: 7 }, (_, i) => ({
            name: `${9 + i} AM`,
            data: this.emergencyRoomVisitsService.generateData(count, yrange)
        }));
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