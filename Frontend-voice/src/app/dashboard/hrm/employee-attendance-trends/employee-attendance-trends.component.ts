import { Component } from '@angular/core';
import { EmployeeAttendanceTrendsService } from './employee-attendance-trends.service';

@Component({
    selector: 'app-employee-attendance-trends',
    imports: [],
    templateUrl: './employee-attendance-trends.component.html',
    styleUrl: './employee-attendance-trends.component.scss'
})
export class EmployeeAttendanceTrendsComponent {

    constructor(
        private employeeAttendanceTrendsService: EmployeeAttendanceTrendsService
    ) {}

    ngOnInit(): void {
        this.employeeAttendanceTrendsService.loadChart();
    }

}