import { Component } from '@angular/core';
import { TotalProfitService } from './total-profit.service';

@Component({
    selector: 'app-total-profit',
    imports: [],
    templateUrl: './total-profit.component.html',
    styleUrl: './total-profit.component.scss'
})
export class TotalProfitComponent {

    constructor(
        private totalProfitService: TotalProfitService
    ) {}

    ngOnInit(): void {
        this.totalProfitService.loadChart();
    }

}