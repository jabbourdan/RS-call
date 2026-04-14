import { Component, HostListener } from '@angular/core';
import { PerformancePerInvestmentService } from './performance-per-investment.service';

@Component({
    selector: 'app-performance-per-investment',
    imports: [],
    templateUrl: './performance-per-investment.component.html',
    styleUrl: './performance-per-investment.component.scss'
})
export class PerformancePerInvestmentComponent {

    selectedTimeframe: string = 'Last Month'; // Default selection set to Last Month
    chartData: { [key: string]: { series: { name: string; data: { x: string; y: number[] }[] }[] } };

    constructor(
        private performancePerInvestmentService: PerformancePerInvestmentService
    ) {
        this.chartData = {
            'Last Day': {
                series: [
                    {
                        name: "Coin",
                        data: [
                            { x: "Bitcoin", y: [10, 5] },
                            { x: "Ethereum", y: [7, 4] },
                            { x: "Solana", y: [6, 3] },
                            { x: "Tether", y: [8, 6] },
                            { x: "USDC", y: [3, 4] },
                            { x: "XRP", y: [2, 3] }
                        ]
                    }
                ]
            },
            'Last Week': {
                series: [
                    {
                        name: "Coin",
                        data: [
                            { x: "Bitcoin", y: [2, 6] },
                            { x: "Ethereum", y: [4, 8] },
                            { x: "Solana", y: [8, 10] },
                            { x: "Tether", y: [4, 6] },
                            { x: "USDC", y: [2, 4] },
                            { x: "XRP", y: [0, 2] }
                        ]
                    }
                ]
            },
            'Last Month': {
                series: [
                    {
                        name: "Coin",
                        data: [
                            { x: "Bitcoin", y: [8, 2] },
                            { x: "Ethereum", y: [5, 3] },
                            { x: "Solana", y: [4, 8] },
                            { x: "Tether", y: [3, 5] },
                            { x: "USDC", y: [2, 5] },
                            { x: "XRP", y: [1, 2] }
                        ]
                    }
                ]
            },
            'Last Year': {
                series: [
                    {
                        name: "Coin",
                        data: [
                            { x: "Bitcoin", y: [20, 24] },
                            { x: "Ethereum", y: [0, 15] },
                            { x: "Solana", y: [20, 14] },
                            { x: "Tether", y: [10, 18] },
                            { x: "USDC", y: [4, 12] },
                            { x: "XRP", y: [2, 10] }
                        ]
                    }
                ]
            }
        };
    }

    ngOnInit(): void {
        const defaultData = this.chartData[this.selectedTimeframe];
        this.performancePerInvestmentService.loadChart(defaultData.series);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe;
        const selectedData = this.chartData[timeframe];
        this.performancePerInvestmentService.updateChart(selectedData.series);
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