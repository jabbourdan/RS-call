import { Component, HostListener } from '@angular/core';
import { PatientRetentionService } from './patient-retention.service';

@Component({
    selector: 'app-patient-retention',
    imports: [],
    templateUrl: './patient-retention.component.html',
    styleUrl: './patient-retention.component.scss'
})
export class PatientRetentionComponent {

    selectedTimeframe: string = 'This Week'; // Default selection
    chartData: { [key: string]: { series: { name: string; data: number[] }[]; categories: string[] } };

    constructor(
        private patientRetentionService: PatientRetentionService
    ) {
        this.chartData = {
            'This Day': {
                series: [
                    { name: "Old Patient", data: [12, 15, 10, 8, 14] },
                    { name: "New Patient", data: [9, 11, 8, 6, 12] }
                ],
                categories: ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM']
            },
            'This Week': {
                series: [
                    { name: "Old Patient", data: [45, 52, 38, 24, 33, 26, 21] },
                    { name: "New Patient", data: [35, 41, 62, 42, 13, 18, 29] }
                ],
                categories: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
            },
            'This Month': {
                series: [
                    { name: "Old Patient", data: [160, 180, 175, 190] },
                    { name: "New Patient", data: [120, 140, 135, 150] }
                ],
                categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
            },
            'This Year': {
                series: [
                    { name: "Old Patient", data: [600, 700, 800, 750] },
                    { name: "New Patient", data: [500, 550, 600, 580] }
                ],
                categories: ['Q1', 'Q2', 'Q3', 'Q4']
            }
        };
    }

    ngOnInit(): void {
        const defaultData = this.chartData[this.selectedTimeframe];
        this.patientRetentionService.loadChart(defaultData.series, defaultData.categories);
    }
    
    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe; // Update dropdown button text
        const selectedData = this.chartData[timeframe];
    
        this.patientRetentionService.updateChart(selectedData.series, selectedData.categories);
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