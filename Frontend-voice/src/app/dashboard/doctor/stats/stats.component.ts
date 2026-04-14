import { Component } from '@angular/core';
import { AppointmentsComponent } from './appointments/appointments.component';
import { PatientsComponent } from './patients/patients.component';
import { OperationsComponent } from './operations/operations.component';
import { EarningsComponent } from './earnings/earnings.component';

@Component({
    selector: 'app-stats',
    imports: [AppointmentsComponent, PatientsComponent, OperationsComponent, EarningsComponent],
    templateUrl: './stats.component.html',
    styleUrl: './stats.component.scss'
})
export class StatsComponent {}