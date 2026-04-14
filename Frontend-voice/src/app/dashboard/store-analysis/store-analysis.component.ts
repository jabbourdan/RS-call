import { Component } from '@angular/core';
import { WelcomeComponent } from './welcome/welcome.component';
import { CustomerVisitsComponent } from './customer-visits/customer-visits.component';
import { TopSellingProductsComponent } from './top-selling-products/top-selling-products.component';
import { GrossRevenueComponent } from './gross-revenue/gross-revenue.component';
import { RecentSalesComponent } from './recent-sales/recent-sales.component';
import { SalesByGenderComponent } from './sales-by-gender/sales-by-gender.component';
import { SalesThisMonthComponent } from './sales-this-month/sales-this-month.component';
import { SalesByCategoryComponent } from './sales-by-category/sales-by-category.component';
import { StockAlertsComponent } from './stock-alerts/stock-alerts.component';

@Component({
    selector: 'app-store-analysis',
    imports: [WelcomeComponent, CustomerVisitsComponent, TopSellingProductsComponent, GrossRevenueComponent, RecentSalesComponent, SalesByGenderComponent, SalesThisMonthComponent, SalesByCategoryComponent, StockAlertsComponent],
    templateUrl: './store-analysis.component.html',
    styleUrl: './store-analysis.component.scss'
})
export class StoreAnalysisComponent {}