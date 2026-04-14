import { Component } from '@angular/core';
import { WelcomeComponent } from './welcome/welcome.component';
import { StatsComponent } from './stats/stats.component';
import { PatientRetentionComponent } from './patient-retention/patient-retention.component';
import { PatientDistributionComponent } from './patient-distribution/patient-distribution.component';
import { TodaysScheduleComponent } from './todays-schedule/todays-schedule.component';
import { UpgradePlanComponent } from './upgrade-plan/upgrade-plan.component';
import { IncomeVsExpenseComponent } from './income-vs-expense/income-vs-expense.component';
import { MyRecentPatientsComponent } from './my-recent-patients/my-recent-patients.component';
import { RecentLabReportsComponent } from './recent-lab-reports/recent-lab-reports.component';

@Component({
    selector: 'app-doctor',
    imports: [WelcomeComponent, StatsComponent, PatientRetentionComponent, PatientDistributionComponent, TodaysScheduleComponent, UpgradePlanComponent, IncomeVsExpenseComponent, MyRecentPatientsComponent, RecentLabReportsComponent],
    templateUrl: './doctor.component.html',
    styleUrl: './doctor.component.scss'
})
export class DoctorComponent {}