import { Component } from '@angular/core';
import { WeeklyExpensesService } from './weekly-expenses.service';

@Component({
    selector: 'app-weekly-expenses',
    imports: [],
    templateUrl: './weekly-expenses.component.html',
    styleUrl: './weekly-expenses.component.scss'
})
export class WeeklyExpensesComponent {

    constructor(
        private weeklyExpensesService: WeeklyExpensesService
    ) {}

    ngOnInit(): void {
        this.weeklyExpensesService.loadChart();
    }

}