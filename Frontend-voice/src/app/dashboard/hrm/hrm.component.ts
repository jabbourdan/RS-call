import { Component } from '@angular/core';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { TotalEmployeesComponent } from './total-employees/total-employees.component';
import { ResignedEmployeesComponent } from './resigned-employees/resigned-employees.component';
import { NewEmployeesComponent } from './new-employees/new-employees.component';
import { EmployeeAttendanceTrendsComponent } from './employee-attendance-trends/employee-attendance-trends.component';
import { EmployeeWorkFormatComponent } from './employee-work-format/employee-work-format.component';
import { EmployeeSalaryComponent } from './employee-salary/employee-salary.component';
import { EmployeeLeaveRequestComponent } from './employee-leave-request/employee-leave-request.component';

@Component({
    selector: 'app-hrm',
    imports: [WelcomeComponent, TotalEmployeesComponent, ResignedEmployeesComponent, NewEmployeesComponent, EmployeeAttendanceTrendsComponent, EmployeeWorkFormatComponent, EmployeeSalaryComponent, EmployeeLeaveRequestComponent, EmployeeListComponent],
    templateUrl: './hrm.component.html',
    styleUrl: './hrm.component.scss'
})
export class HrmComponent {}