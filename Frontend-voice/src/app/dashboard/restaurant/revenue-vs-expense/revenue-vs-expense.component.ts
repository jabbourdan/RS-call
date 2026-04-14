import { Component, HostListener } from '@angular/core';
import { RevenueVsExpenseService } from './revenue-vs-expense.service';

@Component({
    selector: 'app-revenue-vs-expense',
    imports: [],
    templateUrl: './revenue-vs-expense.component.html',
    styleUrl: './revenue-vs-expense.component.scss'
})
export class RevenueVsExpenseComponent {

    selectedTimeframe: string = 'Daily'; // Default selection
    chartData: { [key: string]: { series: { name: string; data: number[] }[], categories: string[] } };

    constructor(
        private revenueVsExpenseService: RevenueVsExpenseService
    ) {
        this.chartData = {
            'Daily': {
                series: [
                    { name: "Revenue", data: [5, 7, 8, 6, 9, 10, 7] },
                    { name: "Expense", data: [4, 6, 7, 5, 8, 9, 6] }
                ],
                categories: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
            },
            'Weekly': {
                series: [
                    { name: "Revenue", data: [25, 19, 32, 60] },
                    { name: "Expense", data: [32, 25, 22, 40] }
                ],
                categories: ["Week 1", "Week 2", "Week 3", "Week 4"]
            },
            'Monthly': {
                series: [
                    { name: "Revenue", data: [200, 220, 250, 230, 210, 240, 280, 260, 250, 270, 290, 310] },
                    { name: "Expense", data: [180, 200, 210, 220, 200, 190, 230, 220, 210, 240, 260, 280] }
                ],
                categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            },
            'Yearly': {
                series: [
                    { name: "Revenue", data: [2400, 2600, 2800, 3000, 3200] },
                    { name: "Expense", data: [2000, 2200, 2400, 2600, 2800] }
                ],
                categories: ["2021", "2022", "2023", "2024", "2025"]
            }
        };
    }

    ngOnInit(): void {
        const defaultData = this.chartData[this.selectedTimeframe];
        this.revenueVsExpenseService.loadChart(defaultData.series, defaultData.categories);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe;
        const selectedData = this.chartData[timeframe];
        this.revenueVsExpenseService.updateChart(selectedData.series, selectedData.categories);
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