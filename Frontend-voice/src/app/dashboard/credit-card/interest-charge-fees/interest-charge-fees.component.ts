import { Component, HostListener } from '@angular/core';
import { InterestChargeFeesService } from './interest-charge-fees.service';

@Component({
    selector: 'app-interest-charge-fees',
    imports: [],
    templateUrl: './interest-charge-fees.component.html',
    styleUrl: './interest-charge-fees.component.scss'
})
export class InterestChargeFeesComponent {

    selectedTimeframe: string = 'Yearly'; // Default selection
    chartData: { [key: string]: { series: { name: string; data: number[] }[], categories: string[] } };

    constructor(
        private interestChargeFeesService: InterestChargeFeesService
    ) {
        this.chartData = {
            'Daily': {
                series: [
                    { name: "Interest Charge", data: [3, 5, 2, 4] },
                    { name: "Fees", data: [1, 2, 1, 2] }
                ],
                categories: ["09:00", "12:00", "15:00", "18:00"]
            },
            'Weekly': {
                series: [
                    { name: "Interest Charge", data: [10, 12, 15, 9, 14, 8, 11] },
                    { name: "Fees", data: [2, 3, 5, 2, 4, 3, 2] }
                ],
                categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            },
            'Monthly': {
                series: [
                    { name: "Interest Charge", data: [20, 18, 22, 24, 25] },
                    { name: "Fees", data: [4, 5, 6, 7, 5] }
                ],
                categories: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"]
            },
            'Yearly': {
                series: [
                    { name: "Interest Charge", data: [28, 15, 18, 25] },
                    { name: "Fees", data: [5, 7, 8, 9] }
                ],
                categories: ["2022", "2023", "2024", "2025"]
            }
        };
    }

    ngOnInit(): void {
        const defaultData = this.chartData[this.selectedTimeframe];
        this.interestChargeFeesService.loadChart(defaultData.series, defaultData.categories);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe;
        const selectedData = this.chartData[timeframe];
        this.interestChargeFeesService.updateChart(selectedData.series, selectedData.categories);
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