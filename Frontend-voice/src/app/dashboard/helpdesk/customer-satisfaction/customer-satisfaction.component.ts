import { Component, HostListener } from '@angular/core';
import { CustomerSatisfactionService } from './customer-satisfaction.service';

@Component({
    selector: 'app-customer-satisfaction',
    imports: [],
    templateUrl: './customer-satisfaction.component.html',
    styleUrl: './customer-satisfaction.component.scss'
})
export class CustomerSatisfactionComponent {

    selectedTimeframe: string = 'This Week';
    chartData: { [key: string]: { series: number[]; labels: string[] } };

    constructor(
        private customerSatisfactionService: CustomerSatisfactionService
    ) {
        this.chartData = {
            'This Day': {
                series: [20, 30, 40, 10],
                labels: ["Highly Satisfied", "Satisfied", "Low Satisfied", "Unsatisfied"]
            },
            'This Week': {
                series: [50, 15, 75, 50],
                labels: ["Highly Satisfied", "Satisfied", "Low Satisfied", "Unsatisfied"]
            },
            'This Month': {
                series: [60, 20, 50, 70],
                labels: ["Highly Satisfied", "Satisfied", "Low Satisfied", "Unsatisfied"]
            },
            'This Year': {
                series: [200, 100, 150, 80],
                labels: ["Highly Satisfied", "Satisfied", "Low Satisfied", "Unsatisfied"]
            }
        };
    }

    ngOnInit(): void {
        const defaultData = this.chartData[this.selectedTimeframe];
        this.customerSatisfactionService.loadChart(defaultData.series, defaultData.labels);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe;
        const selectedData = this.chartData[timeframe];
        this.customerSatisfactionService.updateChart(selectedData.series, selectedData.labels);
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