import { Component } from '@angular/core';
import { TodaysScheduleComponent } from './todays-schedule/todays-schedule.component';
import { TodaysAppointmentsComponent } from "./todays-appointments/todays-appointments.component";

@Component({
    selector: 'app-d-appointments',
    imports: [TodaysScheduleComponent, TodaysAppointmentsComponent],
    templateUrl: './d-appointments.component.html',
    styleUrl: './d-appointments.component.scss'
})
export class DAppointmentsComponent {}