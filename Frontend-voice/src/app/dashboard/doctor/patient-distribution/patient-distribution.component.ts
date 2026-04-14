import { Component, HostListener } from '@angular/core';
import { PatientDistributionService } from './patient-distribution.service';

@Component({
    selector: 'app-patient-distribution',
    imports: [],
    templateUrl: './patient-distribution.component.html',
    styleUrl: './patient-distribution.component.scss'
})
export class PatientDistributionComponent {

    selectedTimeframe: string = 'Weekly'; // Default selection
    chartData: { [key: string]: { series: number[]; labels: string[] } };

    constructor(
        private patientDistributionService: PatientDistributionService
    ) {
        this.chartData = {
            'Daily': {
                series: [40, 20, 10],
                labels: ["Male", "Female", "Children"]
            },
            'Weekly': {
                series: [50, 30, 20],
                labels: ["Male", "Female", "Children"]
            },
            'Monthly': {
                series: [200, 150, 100],
                labels: ["Male", "Female", "Children"]
            },
            'Yearly': {
                series: [2500, 2000, 1500],
                labels: ["Male", "Female", "Children"]
            }
        };
    }

    ngOnInit(): void {
        const defaultData = this.chartData[this.selectedTimeframe];
        this.patientDistributionService.loadChart(defaultData.series, defaultData.labels);
    }

    onTimeframeChange(timeframe: string): void {
        this.selectedTimeframe = timeframe;
        const selectedData = this.chartData[timeframe];
        this.patientDistributionService.updateChart(selectedData.series, selectedData.labels);
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