import { Component } from '@angular/core';
import { TodaysPaymentComponent } from './todays-payment/todays-payment.component';
import { TotalUsersComponent } from './total-users/total-users.component';
import { RevenueComponent } from './revenue/revenue.component';
import { ConversionComponent } from './conversion/conversion.component';
import { TopRefersComponent } from './top-refers/top-refers.component';
import { ActiveUsersComponent } from './active-users/active-users.component';
import { LatestTransactionsComponent } from './latest-transactions/latest-transactions.component';
import { UpgradePlansComponent } from './upgrade-plans/upgrade-plans.component';
import { ProductTradeConditionsComponent } from './product-trade-conditions/product-trade-conditions.component';
import { GrossRevenueComponent } from './gross-revenue/gross-revenue.component';
import { SalesByCountryComponent } from './sales-by-country/sales-by-country.component';
import { UsersComponent } from './users/users.component';

@Component({
    selector: 'app-saas',
    imports: [TodaysPaymentComponent, TotalUsersComponent, RevenueComponent, ConversionComponent, TopRefersComponent, ActiveUsersComponent, LatestTransactionsComponent, UpgradePlansComponent, UsersComponent, ProductTradeConditionsComponent, GrossRevenueComponent, SalesByCountryComponent],
    templateUrl: './saas.component.html',
    styleUrl: './saas.component.scss'
})
export class SaasComponent {}