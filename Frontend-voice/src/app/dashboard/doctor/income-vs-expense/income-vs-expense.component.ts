import { Component, HostListener } from '@angular/core';
import { IncomeVsExpenseService } from './income-vs-expense.service';

@Component({
    selector: 'app-income-vs-expense',
    imports: [],
    templateUrl: './income-vs-expense.component.html',
    styleUrl: './income-vs-expense.component.scss'
})
export class IncomeVsExpenseComponent {

    selectedTimeframe: string = 'This Week'; // Default selection
    chartData: { [key: string]: { series: { name: string; data: number[] }[]; categories: string[] } };

    constructor(
        private incomeVsExpenseService: IncomeVsExpenseService
    ) {
        this.chartData = {
            'This Day': {
                series: [
                    { name: 'Income', data: [10] },
                    { name: 'Expense', data: [-8] }
                ],
                categories: ['Today']
            },
            'This Week': {
                series: [
                    { name: 'Income', data: [70, 42, 70, 120, 40, 70, 90] },
                    { name: 'Expense', data: [-70, -44, -70, -120, -40, -70, -120] }
                ],
                categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            'This Month': {
                series: [
                    { name: 'Income', data: [200, 180, 250, 300] },
                    { name: 'Expense', data: [-150, -120, -200, -250] }
                ],
                categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
            },
            'This Year': {
                series: [
                    { name: 'Income', data: [900, 1100, 950, 1200] },
                    { name: 'Expense', data: [-800, -950, -900, -1100] }
                ],
                categories: ['Q1', 'Q2', 'Q3', 'Q4']
            }
        };
    }

    ngOnInit(): void {
        const defaultData = this.chartData[this.selectedTimeframe];
        this.incomeVsExpenseService.loadChart(defaultData.series, defaultData.categories);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe;
        const selectedData = this.chartData[timeframe];
        this.incomeVsExpenseService.updateChart(selectedData.series, selectedData.categories);
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