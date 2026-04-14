import { Component } from '@angular/core';
import { ExpenseService } from './expense.service';

@Component({
    selector: 'app-expense',
    imports: [],
    templateUrl: './expense.component.html',
    styleUrl: './expense.component.scss'
})
export class ExpenseComponent {

    constructor(
        private expenseService: ExpenseService
    ) {}

    ngOnInit(): void {
        this.expenseService.loadChart();
    }

}