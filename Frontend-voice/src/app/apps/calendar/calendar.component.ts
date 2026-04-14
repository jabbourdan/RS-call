import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { WorkingScheduleComponent } from './working-schedule/working-schedule.component';

@Component({
    selector: 'app-calendar',
    imports: [RouterLink, FullCalendarModule, WorkingScheduleComponent],
    templateUrl: './calendar.component.html',
    styleUrl: './calendar.component.scss'
})
export class CalendarComponent {

    // Calendar
    calendarOptions: CalendarOptions = {
        initialView: 'dayGridMonth',
        dayMaxEvents: true, // when too many events in a day, show the popover
        weekends: true,
        events: [
            {
                title: 'Annual Conference 2025',
                date: '2025-04-01'
            },
            {
                title: 'Product Lunch Webinar 2025 & Meet With Trezo Angular',
                start: '2025-04-09',
                end: '2025-04-10'
            },
            {
                title: 'Tech Summit 2025',
                date: '2025-04-14'
            },
            {
                title: 'Web Development Seminar',
                date: '2025-04-17'
            },
            {
                title: 'Meeting with UI/UX Designers',
                date: '2025-04-26'
            },
            {
                title: 'Meeting with Developers',
                date: '2025-04-30'
            },
            {
                title: 'Annual Conference 2025',
                date: '2025-05-10'
            },
            {
                title: 'Product Lunch Webinar 2025 & Meet With Trezo Angular',
                start: '2025-05-14',
                end: '2025-05-16'
            },
            {
                title: 'Tech Summit 2025',
                date: '2025-05-24'
            },
            {
                title: 'Meeting with UI/UX Designers',
                date: '2025-05-26'
            },
            {
                title: 'Web Development Seminar',
                date: '2025-05-28'
            },
            {
                title: 'Annual Conference 2025',
                date: '2025-06-21'
            },
            {
                title: 'Product Lunch Webinar 2025 & Meet With Trezo Angular',
                start: '2025-06-05',
                end: '2025-06-08'
            },
            {
                title: 'Tech Summit 2025',
                date: '2025-06-14'
            },
            {
                title: 'Web Development Seminar',
                date: '2025-06-17'
            },
            {
                title: 'Meeting with UI/UX Designers',
                date: '2025-06-26'
            },
            {
                title: 'Meeting with Developers',
                date: '2025-06-30'
            },
            {
                title: 'Annual Conference 2025',
                date: '2025-07-05'
            },
            {
                title: 'Product Lunch Webinar 2025 & Meet With Trezo Angular',
                start: '2025-07-09',
                end: '2025-07-11'
            },
            {
                title: 'Tech Summit 2025',
                date: '2025-07-20'
            },
            {
                title: 'Meeting with UI/UX Designers',
                date: '2025-07-26'
            },
            {
                title: 'Web Development Seminar',
                date: '2025-07-29'
            },
            {
                title: 'Web Development Seminar',
                date: '2025-08-10'
            },
            {
                title: 'Web Development Seminar',
                date: '2025-08-15'
            },
            {
                title: 'Web Development Seminar',
                date: '2025-09-20'
            }
        ],
        plugins: [dayGridPlugin]
    };

}