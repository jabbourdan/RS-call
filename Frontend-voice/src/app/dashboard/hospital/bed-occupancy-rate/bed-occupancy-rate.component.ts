import { Component, HostListener } from '@angular/core';
import { BedOccupancyRateService } from './bed-occupancy-rate.service';

@Component({
    selector: 'app-bed-occupancy-rate',
    imports: [],
    templateUrl: './bed-occupancy-rate.component.html',
    styleUrl: './bed-occupancy-rate.component.scss'
})
export class BedOccupancyRateComponent {

    selectedTimeframe: string = 'This Day'; // Default dropdown text
    dataMap: { [key: string]: number[] } = {
        'This Day': [1275, 825, 450],
        'This Week': [1300, 900, 400],
        'This Month': [1400, 1000, 300],
        'This Year': [1500, 1200, 250]
    };

    constructor(
        private bedOccupancyRateService: BedOccupancyRateService
    ) {}

    ngOnInit(): void {
        // Load the default chart data
        const defaultData = this.dataMap[this.selectedTimeframe];
        this.bedOccupancyRateService.loadChart(defaultData);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe; // Update dropdown text
        const updatedData = this.dataMap[timeframe];
        this.bedOccupancyRateService.updateChartData(updatedData);
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