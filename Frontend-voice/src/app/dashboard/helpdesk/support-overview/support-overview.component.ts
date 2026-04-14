import { Component, HostListener } from '@angular/core';
import { SupportOverviewService } from './support-overview.service';

@Component({
    selector: 'app-support-overview',
    imports: [],
    templateUrl: './support-overview.component.html',
    styleUrl: './support-overview.component.scss'
})
export class SupportOverviewComponent {

    selectedTimeframe: string = 'Last Week'; // Default dropdown text
    chartData: { [key: string]: number[] };

    constructor(
        private supportOverviewService: SupportOverviewService
    ) {
        // Define the data for each timeframe
        this.chartData = {
            'Last Day': [10, 5, 3, 2],
            'Last Week': [55, 44, 30, 12],
            'Last Month': [200, 150, 100, 50],
            'Last Year': [800, 600, 400, 200]
        };
    }

    ngOnInit(): void {
        // Load the default chart
        const defaultData = this.chartData[this.selectedTimeframe];
        this.supportOverviewService.loadChart(defaultData);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe; // Update button text
        const selectedData = this.chartData[timeframe];
        this.supportOverviewService.updateChart(selectedData);
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