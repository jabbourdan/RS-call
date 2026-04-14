import { Component } from '@angular/core';
import { ExpenseBreakdownService } from './expense-breakdown.service';

@Component({
    selector: 'app-expense-breakdown',
    imports: [],
    templateUrl: './expense-breakdown.component.html',
    styleUrl: './expense-breakdown.component.scss'
})
export class ExpenseBreakdownComponent {

    constructor(
        private expenseBreakdownService: ExpenseBreakdownService
    ) {}

    ngOnInit(): void {
        this.expenseBreakdownService.loadChart();
    }

}