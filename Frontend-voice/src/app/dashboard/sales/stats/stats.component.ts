import { Component } from '@angular/core';
import { TotalSalesComponent } from './total-sales/total-sales.component';
import { TotalOrdersComponent } from './total-orders/total-orders.component';
import { TotalProfitComponent } from './total-profit/total-profit.component';
import { TotalRevenueComponent } from './total-revenue/total-revenue.component';

@Component({
    selector: 'app-stats',
    imports: [TotalSalesComponent, TotalOrdersComponent, TotalProfitComponent, TotalRevenueComponent],
    templateUrl: './stats.component.html',
    styleUrl: './stats.component.scss'
})
export class StatsComponent {}