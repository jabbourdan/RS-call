import { Component } from '@angular/core';
import { TotalRevenueComponent } from './total-revenue/total-revenue.component';
import { TotalShipmentsComponent } from './total-shipments/total-shipments.component';
import { TotalCustomersComponent } from './total-customers/total-customers.component';
import { TotalOrdersComponent } from './total-orders/total-orders.component';
import { ShipmentDeliveredComponent } from './shipment-delivered/shipment-delivered.component';
import { AverageDeliveryTimeComponent } from './average-delivery-time/average-delivery-time.component';
import { LiveShipmentStatusComponent } from './live-shipment-status/live-shipment-status.component';
import { TopCountriesComponent } from './top-countries/top-countries.component';
import { TrackingOrdersComponent } from './tracking-orders/tracking-orders.component';
import { ChatComponent } from './chat/chat.component';
import { TopShippingMethodsComponent } from './top-shipping-methods/top-shipping-methods.component';
import { TodaysShipmentsComponent } from './todays-shipments/todays-shipments.component';
import { OnTimeDeliveryComponent } from './on-time-delivery/on-time-delivery.component';
import { ShipmentListComponent } from './shipment-list/shipment-list.component';

@Component({
    selector: 'app-shipment',
    imports: [TotalRevenueComponent, TotalShipmentsComponent, TotalCustomersComponent, TotalOrdersComponent, ShipmentDeliveredComponent, AverageDeliveryTimeComponent, LiveShipmentStatusComponent, TopCountriesComponent, TrackingOrdersComponent, ChatComponent, TopShippingMethodsComponent, TodaysShipmentsComponent, OnTimeDeliveryComponent, ShipmentListComponent],
    templateUrl: './shipment.component.html',
    styleUrl: './shipment.component.scss'
})
export class ShipmentComponent {}