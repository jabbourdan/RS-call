import { Component } from '@angular/core';
import { TotalSalesComponent } from './total-sales/total-sales.component';
import { TotalTransactionsComponent } from './total-transactions/total-transactions.component';
import { AverageOrderValueComponent } from './average-order-value/average-order-value.component';
import { TotalDiscountComponent } from './total-discount/total-discount.component';
import { SalesAnalyticsComponent } from './sales-analytics/sales-analytics.component';
import { CustomerSegmentationComponent } from './customer-segmentation/customer-segmentation.component';
import { CategoriesComponent } from './categories/categories.component';
import { OrderDetailsComponent } from './order-details/order-details.component';

@Component({
    selector: 'app-pos-system',
    imports: [TotalSalesComponent, TotalTransactionsComponent, AverageOrderValueComponent, TotalDiscountComponent, SalesAnalyticsComponent, CustomerSegmentationComponent, CategoriesComponent, OrderDetailsComponent],
    templateUrl: './pos-system.component.html',
    styleUrl: './pos-system.component.scss'
})
export class PosSystemComponent {}