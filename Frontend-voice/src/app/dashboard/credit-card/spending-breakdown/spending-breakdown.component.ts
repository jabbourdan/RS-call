import { Component, HostListener } from '@angular/core';
import { SpendingBreakdownService } from './spending-breakdown.service';

@Component({
    selector: 'app-spending-breakdown',
    imports: [],
    templateUrl: './spending-breakdown.component.html',
    styleUrl: './spending-breakdown.component.scss'
})
export class SpendingBreakdownComponent {

    selectedTimeframe: string = 'Weekly'; // Default selection
    chartData: { [key: string]: { series: number[]; labels: string[] } };

    constructor(
        private spendingBreakdownService: SpendingBreakdownService
    ) {
        this.chartData = {
            'Daily': {
                series: [5, 8, 2, 4, 6, 2],
                labels: ["Groceries", "Utilities", "Rent", "Entertainment", "Transportation", "Other"]
            },
            'Weekly': {
                series: [30, 20, 12, 10, 8, 6],
                labels: ["Groceries", "Utilities", "Rent", "Entertainment", "Transportation", "Other"]
            },
            'Monthly': {
                series: [220, 150, 100, 100, 220, 50],
                labels: ["Groceries", "Utilities", "Rent", "Entertainment", "Transportation", "Other"]
            },
            'Yearly': {
                series: [1800, 2400, 600, 1200, 1800, 600],
                labels: ["Groceries", "Utilities", "Rent", "Entertainment", "Transportation", "Other"]
            }
        };
    }

    ngOnInit(): void {
        const defaultData = this.chartData[this.selectedTimeframe];
        this.spendingBreakdownService.loadChart(defaultData.series, defaultData.labels);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe;
        const selectedData = this.chartData[timeframe];
        this.spendingBreakdownService.updateChart(selectedData.series, selectedData.labels);
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