import { Component } from '@angular/core';
import { LiveShipmentStatusService } from './live-shipment-status.service';

@Component({
    selector: 'app-live-shipment-status',
    imports: [],
    templateUrl: './live-shipment-status.component.html',
    styleUrl: './live-shipment-status.component.scss'
})
export class LiveShipmentStatusComponent {

    constructor(
        private liveShipmentStatusService: LiveShipmentStatusService
    ) {}

    ngOnInit(): void {
        this.liveShipmentStatusService.loadChart();
    }

}