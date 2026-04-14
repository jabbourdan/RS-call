import { Component } from '@angular/core';
import { CashEndMonthService } from './cash-end-month.service';

@Component({
    selector: 'app-cash-end-month',
    imports: [],
    templateUrl: './cash-end-month.component.html',
    styleUrl: './cash-end-month.component.scss'
})
export class CashEndMonthComponent {

    constructor(
        private cashEndMonthService: CashEndMonthService
    ) {}

    ngOnInit(): void {
        this.cashEndMonthService.loadChart();
    }

}