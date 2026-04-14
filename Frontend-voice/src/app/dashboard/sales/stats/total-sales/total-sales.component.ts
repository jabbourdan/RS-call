import { Component } from '@angular/core';
import { TotalSalesService } from './total-sales.service';

@Component({
    selector: 'app-total-sales',
    imports: [],
    templateUrl: './total-sales.component.html',
    styleUrl: './total-sales.component.scss'
})
export class TotalSalesComponent {

    constructor(
        private totalSalesService: TotalSalesService
    ) {}

    ngOnInit(): void {
        this.totalSalesService.loadChart();
    }

}