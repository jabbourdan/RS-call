import { Component, HostListener } from '@angular/core';
import { DeviceSessionsService } from './device-sessions.service';

@Component({
    selector: 'app-device-sessions',
    imports: [],
    templateUrl: './device-sessions.component.html',
    styleUrl: './device-sessions.component.scss'
})
export class DeviceSessionsComponent {

    constructor(
        private deviceSessionsService: DeviceSessionsService
    ) {}

    selectedTimeframe: string = 'Last Week'; // Default dropdown text

    ngOnInit(): void {
        const initialData = this.getChartData('Last Week');
        this.deviceSessionsService.initializeChart(initialData);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe; // Update button text
        const { series, labels } = this.getChartData(timeframe);
        this.deviceSessionsService.updateChartData(series, labels);
    }

    private getChartData(timeframe: string): { series: number[]; labels: string[] } {
        switch (timeframe) {
            case 'Last Day':
                return {
                    series: [60, 30, 5, 5],
                    labels: ["Desktop", "Mobile", "Tablet", "Others"]
                };
            case 'Last Week':
                return {
                    series: [55, 44, 30, 12],
                    labels: ["Desktop", "Mobile", "Tablet", "Others"]
                };
            case 'Last Month':
                return {
                    series: [50, 40, 20, 10],
                    labels: ["Desktop", "Mobile", "Tablet", "Others"]
                };
            case 'Last Year':
                return {
                    series: [45, 35, 15, 5],
                    labels: ["Desktop", "Mobile", "Tablet", "Others"]
                };
            default:
                return { series: [], labels: [] };
        }
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