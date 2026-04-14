import { Component } from '@angular/core';
import { OverviewComponent } from './overview/overview.component';
import { StudentsListComponent } from './students-list/students-list.component';
import { StatsComponent } from './stats/stats.component';
import { UpcomingEventsComponent } from './upcoming-events/upcoming-events.component';
import { AttendanceAnalyticsComponent } from './attendance-analytics/attendance-analytics.component';
import { TeachersComponent } from './teachers/teachers.component';
import { StudentsOverviewComponent } from './students-overview/students-overview.component';
import { NewAdmissionsComponent } from './new-admissions/new-admissions.component';
import { NoticeBoardComponent } from './notice-board/notice-board.component';

@Component({
    selector: 'app-school',
    imports: [OverviewComponent, StatsComponent, UpcomingEventsComponent, AttendanceAnalyticsComponent, TeachersComponent, StudentsOverviewComponent, NewAdmissionsComponent, NoticeBoardComponent, StudentsListComponent],
    templateUrl: './school.component.html',
    styleUrl: './school.component.scss'
})
export class SchoolComponent {}