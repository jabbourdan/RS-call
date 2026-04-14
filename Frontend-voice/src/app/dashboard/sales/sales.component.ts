import { Component } from '@angular/core';
import { StatsComponent } from './stats/stats.component';
import { RecentEarningsComponent } from './recent-earnings/recent-earnings.component';
import { SalesByLocationsComponent } from './sales-by-locations/sales-by-locations.component';
import { TransactionsHistoryComponent } from './transactions-history/transactions-history.component';
import { RecentOrdersComponent } from './recent-orders/recent-orders.component';
import { RealTimeSalesComponent } from './real-time-sales/real-time-sales.component';
import { SalesOverviewComponent } from './sales-overview/sales-overview.component';
import { GrossEarningsComponent } from './gross-earnings/gross-earnings.component';

@Component({
    selector: 'app-sales',
    imports: [StatsComponent, RecentEarningsComponent, SalesByLocationsComponent, TransactionsHistoryComponent, RecentOrdersComponent, RealTimeSalesComponent, SalesOverviewComponent, GrossEarningsComponent],
    templateUrl: './sales.component.html',
    styleUrl: './sales.component.scss'
})
export class SalesComponent {}