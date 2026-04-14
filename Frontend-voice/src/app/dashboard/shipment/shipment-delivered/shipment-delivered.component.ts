import { Component } from '@angular/core';
import { ShipmentDeliveredService } from './shipment-delivered.service';

@Component({
    selector: 'app-shipment-delivered',
    imports: [],
    templateUrl: './shipment-delivered.component.html',
    styleUrl: './shipment-delivered.component.scss'
})
export class ShipmentDeliveredComponent {

    constructor(
        private shipmentDeliveredService: ShipmentDeliveredService
    ) {}

    ngOnInit(): void {
        this.shipmentDeliveredService.loadChart();
    }

}