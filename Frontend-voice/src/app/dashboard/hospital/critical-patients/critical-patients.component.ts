import { Component } from '@angular/core';
import { CriticalPatientsService } from './critical-patients.service';

@Component({
    selector: 'app-critical-patients',
    imports: [],
    templateUrl: './critical-patients.component.html',
    styleUrl: './critical-patients.component.scss'
})
export class CriticalPatientsComponent {

    constructor(
        private criticalPatientsService: CriticalPatientsService
    ) {}

    ngOnInit(): void {
        this.criticalPatientsService.loadChart();
    }

}