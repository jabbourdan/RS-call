import { Component, HostListener } from '@angular/core';
import { RiskExposureService } from './risk-exposure.service';

@Component({
    selector: 'app-risk-exposure',
    imports: [],
    templateUrl: './risk-exposure.component.html',
    styleUrl: './risk-exposure.component.scss'
})
export class RiskExposureComponent {

    selectedTimeframe: string = 'Yearly'; // Default dropdown text
    chartData: { [key: string]: { series: { name: string; data: number[] }[]; categories: string[] } };

    constructor(private riskExposureService: RiskExposureService) {
        // Define data for each timeframe
        this.chartData = {
            'Weekly': {
                series: [
                    { name: "Risk", data: [10, 20, 15, 25, 35, 30, 40] },
                    { name: "Risk", data: [5, 15, 25, 20, 30, 25, 35] },
                    { name: "Risk", data: [15, 10, 20, 30, 40, 35, 25] }
                ],
                categories: ["Market", "Technology", "Compliance", "Liquidity", "Operational", "Credit"]
            },
            'Monthly': {
                series: [
                    { name: "Risk", data: [50, 60, 70, 80, 90] },
                    { name: "Risk", data: [40, 50, 60, 70, 80] },
                    { name: "Risk", data: [30, 40, 50, 60, 70] }
                ],
                categories: ["Market", "Technology", "Compliance", "Liquidity", "Operational", "Credit"]
            },
            'Yearly': {
                series: [
                    { name: "Risk", data: [80, 50, 30, 40, 100, 20] },
                    { name: "Risk", data: [20, 30, 40, 80, 20, 80] },
                    { name: "Risk", data: [30, 70, 80, 15, 45, 10] }
                ],
                categories: ["Market", "Technology", "Compliance", "Liquidity", "Operational", "Credit"]
            }
        };
    }

    ngOnInit(): void {
        // Load the default chart
        const defaultData = this.chartData[this.selectedTimeframe];
        this.riskExposureService.loadChart(defaultData.series, defaultData.categories);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe; // Update button text
        const selectedData = this.chartData[timeframe];
        this.riskExposureService.updateChartData(selectedData.series, selectedData.categories);
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