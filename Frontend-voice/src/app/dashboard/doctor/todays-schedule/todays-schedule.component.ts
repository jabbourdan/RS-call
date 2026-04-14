import { Component } from '@angular/core';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-todays-schedule',
    imports: [NgClass, NgScrollbarModule],
    templateUrl: './todays-schedule.component.html',
    styleUrl: './todays-schedule.component.scss'
})
export class TodaysScheduleComponent {

    // Calendar
    currentMonth!: number;
    currentYear!: number;
    currentDay!: number; // Current day
    today!: { year: number; month: number; day: number }; // Today's date
    weekdays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    monthNames: string[] = [
        'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
    ];
    daysInMonth: (number | null)[] = []; // Allow null values
    ngOnInit() {
        const today = new Date();
        this.currentMonth = today.getMonth(); // 0-based index
        this.currentYear = today.getFullYear();
        this.currentDay = today.getDate(); // Get current day of the month
        this.today = {
            year: this.currentYear,
            month: this.currentMonth,
            day: this.currentDay
        };
        this.generateCalendar();
    }
    generateCalendar() {
        this.daysInMonth = [];
        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const numberOfDays = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        for (let i = 0; i < firstDay; i++) {
            this.daysInMonth.push(null); // Placeholder for days before the first of the month
        }
        for (let i = 1; i <= numberOfDays; i++) {
            this.daysInMonth.push(i);
        }
    }
    previousMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.generateCalendar();
    }
    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.generateCalendar();
    }
    isToday(day: number | null): boolean {
        if (day === null) return false;
        return (
            this.today.year === this.currentYear &&
            this.today.month === this.currentMonth &&
            this.today.day === day
        );
    }

}