import { Component } from '@angular/core';
import { WelcomeComponent } from './welcome/welcome.component';
import { RevenueComponent } from './revenue/revenue.component';
import { ExpenseComponent } from './expense/expense.component';
import { TopSellingItemsComponent } from './top-selling-items/top-selling-items.component';
import { TotalOrdersComponent } from './total-orders/total-orders.component';
import { PendingOrdersComponent } from './pending-orders/pending-orders.component';
import { RecentOrdersListComponent } from './recent-orders-list/recent-orders-list.component';
import { OrderSummaryComponent } from './order-summary/order-summary.component';
import { RevenueVsExpenseComponent } from './revenue-vs-expense/revenue-vs-expense.component';
import { LowStockAlertsComponent } from './low-stock-alerts/low-stock-alerts.component';
import { StaffPerformanceScoresComponent } from './staff-performance-scores/staff-performance-scores.component';
import { RevenueByBranchesComponent } from './revenue-by-branches/revenue-by-branches.component';
import { TicketsComponent } from './tickets/tickets.component';
import { CustomerRatingsComponent } from './customer-ratings/customer-ratings.component';

@Component({
    selector: 'app-restaurant',
    imports: [WelcomeComponent, RevenueComponent, ExpenseComponent, TopSellingItemsComponent, TotalOrdersComponent, PendingOrdersComponent, RecentOrdersListComponent, OrderSummaryComponent, RevenueVsExpenseComponent, LowStockAlertsComponent, StaffPerformanceScoresComponent, RevenueByBranchesComponent, TicketsComponent, CustomerRatingsComponent],
    templateUrl: './restaurant.component.html',
    styleUrl: './restaurant.component.scss'
})
export class RestaurantComponent {}