import { Component, HostListener } from '@angular/core';
import { SalesOverviewService } from './sales-overview.service';

@Component({
    selector: 'app-sales-overview',
    imports: [],
    templateUrl: './sales-overview.component.html',
    styleUrl: './sales-overview.component.scss'
})
export class SalesOverviewComponent {

    selectedTimeframe: string = 'Yearly'; // Default dropdown text
    chartData: { [key: string]: { series: { name: string; data: number[] }[]; categories: string[] } };

    constructor(
        private salesOverviewService: SalesOverviewService
    ) {
        // Define data for each timeframe
        this.chartData = {
            'Weekly': {
                series: [
                    { name: "Sales", data: [10, 20, 15, 25, 35, 30, 40] },
                    { name: "Sales", data: [5, 15, 25, 20, 30, 25, 35] },
                    { name: "Sales", data: [15, 10, 20, 30, 40, 35, 25] }
                ],
                categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            },
            'Monthly': {
                series: [
                    { name: "Sales", data: [50, 60, 70, 80, 90] },
                    { name: "Sales", data: [40, 50, 60, 70, 80] },
                    { name: "Sales", data: [30, 40, 50, 60, 70] }
                ],
                categories: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"]
            },
            'Yearly': {
                series: [
                    { name: "Sales", data: [80, 50, 30, 40, 100, 20] },
                    { name: "Sales", data: [20, 30, 40, 80, 20, 80] },
                    { name: "Sales", data: [30, 70, 80, 15, 45, 10] }
                ],
                categories: ["2020", "2021", "2022", "2023", "2024", "2025"]
            }
        };
    }

    ngOnInit(): void {
        // Load the default chart
        const defaultData = this.chartData[this.selectedTimeframe];
        this.salesOverviewService.loadChart(defaultData.series, defaultData.categories);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe; // Update button text
        const selectedData = this.chartData[timeframe];
        this.salesOverviewService.updateChartData(selectedData.series, selectedData.categories);
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