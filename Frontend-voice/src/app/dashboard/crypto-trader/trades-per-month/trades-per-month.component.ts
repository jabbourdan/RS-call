import { Component } from '@angular/core';
import { TradesPerMonthService } from './trades-per-month.service';

@Component({
    selector: 'app-trades-per-month',
    imports: [],
    templateUrl: './trades-per-month.component.html',
    styleUrl: './trades-per-month.component.scss'
})
export class TradesPerMonthComponent {

    constructor(
        private tradesPerMonthService: TradesPerMonthService
    ) {}

    ngOnInit(): void {
        this.tradesPerMonthService.loadChart();
    }

}