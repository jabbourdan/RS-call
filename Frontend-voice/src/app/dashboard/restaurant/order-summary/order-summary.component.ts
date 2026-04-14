import { Component, HostListener } from '@angular/core';
import { OrderSummaryService } from './order-summary.service';

@Component({
    selector: 'app-order-summary',
    imports: [],
    templateUrl: './order-summary.component.html',
    styleUrl: './order-summary.component.scss'
})
export class OrderSummaryComponent {

    selectedTimeframe: string = 'Weekly'; // Default selection
    chartData: { [key: string]: { series: number[]; labels: string[] } };

    constructor(
        private orderSummaryService: OrderSummaryService
    ) {
        this.chartData = {
            'Daily': {
                series: [5, 8, 2],
                labels: ["Served", "Processing", "Cancelled"]
            },
            'Weekly': {
                series: [10, 30, 45],
                labels: ["Served", "Processing", "Cancelled"]
            },
            'Monthly': {
                series: [150, 200, 50],
                labels: ["Served", "Processing", "Cancelled"]
            },
            'Yearly': {
                series: [1800, 2400, 600],
                labels: ["Served", "Processing", "Cancelled"]
            }
        };
    }

    ngOnInit(): void {
        const defaultData = this.chartData[this.selectedTimeframe];
        this.orderSummaryService.loadChart(defaultData.series, defaultData.labels);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe;
        const selectedData = this.chartData[timeframe];
        this.orderSummaryService.updateChart(selectedData.series, selectedData.labels);
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