import { Component, HostListener } from '@angular/core';
import { PerformanceOverviewService } from './performance-overview.service';

@Component({
    selector: 'app-performance-overview',
    imports: [],
    templateUrl: './performance-overview.component.html',
    styleUrl: './performance-overview.component.scss'
})
export class PerformanceOverviewComponent {

    selectedTimeframe: string = 'Monthly'; // Default dropdown text
    chartData: {
        [key: string]: {
            series: { name: string, data: number[][] }[],
            xaxisRange: { min: number, max: number }
        }
    };

    constructor(
        private performanceOverviewService: PerformanceOverviewService
    ) {
        // Define the data for each timeframe
        this.chartData = {
            'Weekly': {
                series: [
                    { name: 'Social Campaigns', data: [[100, 20, 10]] },
                    { name: 'Email Newsletter', data: [[300, 50, 15]] },
                    { name: 'TV Campaign', data: [[500, 80, 20]] },
                    { name: 'Google Ads', data: [[650, 40, 25]] },
                    { name: 'Courses', data: [[850, 60, 30]] },
                    { name: 'Radio', data: [[900, 20, 10]] }
                ],
                xaxisRange: { min: 0, max: 1000 }
            },
            'Monthly': {
                series: [
                    { name: 'Social Campaigns', data: [[100, 20, 50]] },
                    { name: 'Email Newsletter', data: [[300, 50, 70]] },
                    { name: 'TV Campaign', data: [[500, 80, 80]] },
                    { name: 'Google Ads', data: [[650, 40, 50]] },
                    { name: 'Courses', data: [[850, 60, 70]] },
                    { name: 'Radio', data: [[900, 20, 60]] }
                ],
                xaxisRange: { min: 0, max: 1000 }
            },
            'Yearly': {
                series: [
                    { name: 'Social Campaigns', data: [[200, 30, 100]] },
                    { name: 'Email Newsletter', data: [[400, 60, 110]] },
                    { name: 'TV Campaign', data: [[600, 90, 120]] },
                    { name: 'Google Ads', data: [[800, 50, 130]] },
                    { name: 'Courses', data: [[900, 70, 140]] },
                    { name: 'Radio', data: [[950, 30, 100]] }
                ],
                xaxisRange: { min: 0, max: 1000 }
            }
        };
    }

    ngOnInit(): void {
        // Load the default chart
        const defaultData = this.chartData[this.selectedTimeframe];
        this.performanceOverviewService.loadChart(defaultData.series, defaultData.xaxisRange);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe; // Update button text
        const selectedData = this.chartData[timeframe];
        this.performanceOverviewService.updateChart(selectedData.series, selectedData.xaxisRange);
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