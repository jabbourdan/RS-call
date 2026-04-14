import { Component, HostListener } from '@angular/core';
import { GrossRevenueService } from './gross-revenue.service';

@Component({
    selector: 'app-gross-revenue',
    imports: [],
    templateUrl: './gross-revenue.component.html',
    styleUrl: './gross-revenue.component.scss'
})
export class GrossRevenueComponent {

    selectedTimeframe: string = 'Monthly'; // Default dropdown text
    chartData: {
        [key: string]: {
            series: { name: string, data: number[] }[],
            categories: string[]
        }
    };

    constructor(
        private grossRevenueService: GrossRevenueService
    ) {
        // Define the data for each timeframe
        this.chartData = {
            'Weekly': {
                series: [
                    { name: 'Sales Revenue', data: [108, 110, 105, 120, 115, 125, 130] },
                    { name: 'Sales Volume', data: [125, 135, 145, 125, 130, 115, 140] },
                    { name: 'Order Value', data: [125, 130, 115, 140, 125, 135, 145] }
                ],
                categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            },
            'Monthly': {
                series: [
                    { name: 'Sales Revenue', data: [108, 130, 110, 140, 130, 115, 125, 115, 125, 140, 140, 130] },
                    { name: 'Sales Volume', data: [140, 120, 125, 130, 110, 145, 135, 110, 130, 120, 130, 145] },
                    { name: 'Order Value', data: [125, 115, 128, 120, 125, 130, 135, 130, 135, 145, 120, 125] }
                ],
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            },
            'Yearly': {
                series: [
                    { name: 'Sales Revenue', data: [150, 175, 190, 200, 220] },
                    { name: 'Sales Volume', data: [240, 250, 170, 200, 210] },
                    { name: 'Order Value', data: [170, 200, 210, 240, 250] }
                ],
                categories: ['2019', '2020', '2021', '2022', '2023']
            }
        };
    }

    ngOnInit(): void {
        // Load the default chart
        const defaultData = this.chartData[this.selectedTimeframe];
        this.grossRevenueService.loadChart(defaultData.series, defaultData.categories);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe; // Update button text
        const selectedData = this.chartData[timeframe];
        this.grossRevenueService.updateChart(selectedData.series, selectedData.categories);
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