import { Component } from '@angular/core';
import { WelcomeComponent } from './welcome/welcome.component';
import { CustomerSatisfactionRateComponent } from './customer-satisfaction-rate/customer-satisfaction-rate.component';
import { NewCustomersComponent } from './new-customers/new-customers.component';
import { TopSellingProductsComponent } from './top-selling-products/top-selling-products.component';
import { CustomersFromChannelsComponent } from './customers-from-channels/customers-from-channels.component';
import { FeaturedServicesComponent } from './featured-services/featured-services.component';
import { RecentAppointmentsComponent } from './recent-appointments/recent-appointments.component';
import { RevenueByServicesComponent } from './revenue-by-services/revenue-by-services.component';
import { TopStylistPerformanceComponent } from './top-stylist-performance/top-stylist-performance.component';
import { TopCustomersComponent } from './top-customers/top-customers.component';

@Component({
    selector: 'app-beauty-salon',
    imports: [WelcomeComponent, CustomerSatisfactionRateComponent, NewCustomersComponent, TopSellingProductsComponent, CustomersFromChannelsComponent, FeaturedServicesComponent, RecentAppointmentsComponent, RevenueByServicesComponent, TopStylistPerformanceComponent, TopCustomersComponent],
    templateUrl: './beauty-salon.component.html',
    styleUrl: './beauty-salon.component.scss'
})
export class BeautySalonComponent {}