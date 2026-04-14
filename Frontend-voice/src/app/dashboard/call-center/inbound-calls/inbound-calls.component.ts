import { Component, HostListener } from '@angular/core';
import { InboundCallsService } from './inbound-calls.service';

@Component({
    selector: 'app-inbound-calls',
    imports: [],
    templateUrl: './inbound-calls.component.html',
    styleUrl: './inbound-calls.component.scss'
})
export class InboundCallsComponent {

    selectedTimeframe: string = 'This Year'; // Default dropdown text
    chartData: { [key: string]: { series: { name: string; data: number[] }[]; categories: string[] } };

    constructor(
        private inboundCallsService: InboundCallsService
    ) {
        this.chartData = {
            'This Day': {
                series: [{ name: "Inbound Calls", data: [10, 15, 20, 25, 30] }],
                categories: ["6 AM", "9 AM", "12 PM", "3 PM", "6 PM"]
            },
            'This Week': {
                series: [{ name: "Inbound Calls", data: [100, 130, 115, 170, 110, 120, 160] }],
                categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            },
            'This Month': {
                series: [{ name: "Inbound Calls", data: [300, 400, 350, 450] }],
                categories: ["Week 1", "Week 2", "Week 3", "Week 4"]
            },
            'This Year': {
                series: [{ name: "Inbound Calls", data: [100, 130, 115, 170, 110, 120, 160, 100, 200, 105, 130, 100] }],
                categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            }
        };
    }

    ngOnInit(): void {
        const defaultData = this.chartData[this.selectedTimeframe];
        this.inboundCallsService.loadChart(defaultData.series, defaultData.categories);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe;
        const selectedData = this.chartData[timeframe];
        this.inboundCallsService.updateChart(selectedData.series, selectedData.categories);
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