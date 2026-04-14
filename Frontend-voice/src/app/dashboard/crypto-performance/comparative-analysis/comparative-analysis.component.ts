import { Component, HostListener } from '@angular/core';
import { ComparativeAnalysisService } from './comparative-analysis.service';

@Component({
    selector: 'app-comparative-analysis',
    imports: [],
    templateUrl: './comparative-analysis.component.html',
    styleUrl: './comparative-analysis.component.scss'
})
export class ComparativeAnalysisComponent {

    selectedTimeframe: string = 'Monthly'; // Default dropdown text
    chartData: {
        [key: string]: {
            series: { name: string, data: number[][] }[],
            xaxisRange: { min: number, max: number }
        }
    };

    constructor(
        private comparativeAnalysisService: ComparativeAnalysisService
    ) {
        // Define the data for each timeframe
        this.chartData = {
            'Weekly': {
                series: [
                    { name: 'Bitcoin', data: [[100, 20, 10]] },
                    { name: 'Ethereum', data: [[300, 50, 15]] },
                    { name: 'Cardano', data: [[500, 80, 20]] },
                    { name: 'Solana', data: [[650, 40, 25]] },
                    { name: 'Tether', data: [[850, 60, 30]] },
                    { name: 'XRP', data: [[900, 20, 10]] }
                ],
                xaxisRange: { min: 0, max: 1000 }
            },
            'Monthly': {
                series: [
                    { name: 'Bitcoin', data: [[100, 20, 50]] },
                    { name: 'Ethereum', data: [[300, 50, 70]] },
                    { name: 'Cardano', data: [[500, 80, 80]] },
                    { name: 'Solana', data: [[650, 40, 50]] },
                    { name: 'Tether', data: [[850, 60, 70]] },
                    { name: 'XRP', data: [[900, 20, 60]] }
                ],
                xaxisRange: { min: 0, max: 1000 }
            },
            'Yearly': {
                series: [
                    { name: 'Bitcoin', data: [[200, 30, 100]] },
                    { name: 'Ethereum', data: [[400, 60, 110]] },
                    { name: 'Cardano', data: [[600, 90, 120]] },
                    { name: 'Solana', data: [[800, 50, 130]] },
                    { name: 'Tether', data: [[900, 70, 140]] },
                    { name: 'XRP', data: [[950, 30, 100]] }
                ],
                xaxisRange: { min: 0, max: 1000 }
            }
        };
    }

    ngOnInit(): void {
        // Load the default chart
        const defaultData = this.chartData[this.selectedTimeframe];
        this.comparativeAnalysisService.loadChart(defaultData.series, defaultData.xaxisRange);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe; // Update button text
        const selectedData = this.chartData[timeframe];
        this.comparativeAnalysisService.updateChart(selectedData.series, selectedData.xaxisRange);
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