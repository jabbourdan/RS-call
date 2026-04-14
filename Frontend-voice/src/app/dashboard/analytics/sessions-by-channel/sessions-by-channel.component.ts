import { Component, HostListener } from '@angular/core';
import { SessionsByChannelService } from './sessions-by-channel.service';

@Component({
    selector: 'app-sessions-by-channel',
    imports: [],
    templateUrl: './sessions-by-channel.component.html',
    styleUrl: './sessions-by-channel.component.scss'
})
export class SessionsByChannelComponent {

    constructor(
        private sessionsByChannelService: SessionsByChannelService
    ) {}

    selectedTimeframe: string = 'Last 30 Days'; // Default dropdown text

    ngOnInit(): void {
        const initialData = this.getChartData('Last 30 Days');
        this.sessionsByChannelService.initializeChart(initialData);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe; // Update button text
        const { series, labels } = this.getChartData(timeframe);
        this.sessionsByChannelService.updateChartData(series, labels);
    }

    private getChartData(timeframe: string): { series: number[]; labels: string[] } {
        switch (timeframe) {
            case 'Last 7 Days':
                return {
                    series: [200, 150, 100, 50, 30, 20],
                    labels: ["Email", "Organic Search", "Direct Browse", "Paid Search", "Social", "Referral"]
                };
            case 'Last 15 Days':
                return {
                    series: [300, 250, 180, 100, 50, 30],
                    labels: ["Email", "Organic Search", "Direct Browse", "Paid Search", "Social", "Referral"]
                };
            case 'Last 30 Days':
                return {
                    series: [976, 651, 818, 459, 320, 209],
                    labels: ["Email", "Organic Search", "Direct Browse", "Paid Search", "Social", "Referral"]
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