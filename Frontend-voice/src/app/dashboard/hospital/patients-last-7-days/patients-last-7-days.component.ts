import { Component } from '@angular/core';
import { PatientsLast7DaysService } from './patients-last-7-days.service';

@Component({
    selector: 'app-patients-last-7-days',
    imports: [],
    templateUrl: './patients-last-7-days.component.html',
    styleUrl: './patients-last-7-days.component.scss'
})
export class PatientsLast7DaysComponent {

    constructor(
        private patientsLast7DaysService: PatientsLast7DaysService
    ) {}

    ngOnInit(): void {
        this.patientsLast7DaysService.loadChart();
    }

}