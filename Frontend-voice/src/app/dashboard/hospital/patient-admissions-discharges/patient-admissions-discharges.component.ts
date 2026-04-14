import { Component, HostListener } from '@angular/core';
import { PatientAdmissionsDischargesService } from './patient-admissions-discharges.service';

@Component({
    selector: 'app-patient-admissions-discharges',
    imports: [],
    templateUrl: './patient-admissions-discharges.component.html',
    styleUrl: './patient-admissions-discharges.component.scss'
})
export class PatientAdmissionsDischargesComponent {

    selectedTimeframe: string = 'Last Week'; // Default dropdown text
    chartData: { [key: string]: { series: { name: string; data: number[] }[]; categories: string[] } };

    constructor(
        private patientAdmissionsDischargesService: PatientAdmissionsDischargesService
    ) {
        // Define data for each timeframe
        this.chartData = {
            'Last Day': {
                series: [
                    { name: "Admissions", data: [50, 60, 70, 80] },
                    { name: "Discharges", data: [40, 50, 60, 70] }
                ],
                categories: ["6 AM", "12 PM", "6 PM", "12 AM"]
            },
            'Last Week': {
                series: [
                    { name: "Admissions", data: [170, 420, 300, 550, 550, 650, 820] },
                    { name: "Discharges", data: [320, 300, 650, 400, 750, 650, 600] }
                ],
                categories: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
            },
            'Last Month': {
                series: [
                    { name: "Admissions", data: [1200, 1400, 1500, 1300] },
                    { name: "Discharges", data: [1000, 1200, 1100, 1250] }
                ],
                categories: ["Week 1", "Week 2", "Week 3", "Week 4"]
            },
            'Last Year': {
                series: [
                    { name: "Admissions", data: [15000, 18000, 17000, 20000] },
                    { name: "Discharges", data: [14000, 16000, 15000, 19000] }
                ],
                categories: ["Q1", "Q2", "Q3", "Q4"]
            }
        };
    }

    ngOnInit(): void {
        // Load the default chart
        const defaultData = this.chartData[this.selectedTimeframe];
        this.patientAdmissionsDischargesService.loadChart(defaultData.series, defaultData.categories);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe; // Update button text
        const selectedData = this.chartData[timeframe];
        this.patientAdmissionsDischargesService.updateChartData(selectedData.series, selectedData.categories);
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