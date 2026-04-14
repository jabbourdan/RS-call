import { Component } from '@angular/core';
import { PatientByAgeComponent } from './patient-by-age/patient-by-age.component';
import { HospitalEarningsComponent } from './hospital-earnings/hospital-earnings.component';
import { ScheduleAppointmentComponent } from './schedule-appointment/schedule-appointment.component';
import { PatientAppointmentsComponent } from './patient-appointments/patient-appointments.component';
import { EmergencyRoomVisitsComponent } from './emergency-room-visits/emergency-room-visits.component';
import { CriticalPatientsComponent } from './critical-patients/critical-patients.component';
import { BedOccupancyRateComponent } from './bed-occupancy-rate/bed-occupancy-rate.component';
import { PatientAdmissionsDischargesComponent } from './patient-admissions-discharges/patient-admissions-discharges.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { OverallVisitorsComponent } from './overall-visitors/overall-visitors.component';
import { PatientsLast7DaysComponent } from './patients-last-7-days/patients-last-7-days.component';

@Component({
    selector: 'app-hospital',
    imports: [WelcomeComponent, OverallVisitorsComponent, PatientsLast7DaysComponent, PatientAdmissionsDischargesComponent, EmergencyRoomVisitsComponent, CriticalPatientsComponent, BedOccupancyRateComponent, PatientAppointmentsComponent, ScheduleAppointmentComponent, PatientByAgeComponent, HospitalEarningsComponent],
    templateUrl: './hospital.component.html',
    styleUrl: './hospital.component.scss'
})
export class HospitalComponent {}