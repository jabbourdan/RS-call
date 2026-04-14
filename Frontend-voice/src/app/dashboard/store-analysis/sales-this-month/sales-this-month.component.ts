import { Component } from '@angular/core';
import { SalesThisMonthService } from './sales-this-month.service';

@Component({
    selector: 'app-sales-this-month',
    imports: [],
    templateUrl: './sales-this-month.component.html',
    styleUrl: './sales-this-month.component.scss'
})
export class SalesThisMonthComponent {

    constructor(
        private salesThisMonthService: SalesThisMonthService
    ) {}

    ngOnInit(): void {
        this.salesThisMonthService.loadChart();
    }

}