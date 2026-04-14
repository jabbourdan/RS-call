import { Component } from '@angular/core';
import { OnTimeDeliveryService } from './on-time-delivery.service';

@Component({
    selector: 'app-on-time-delivery',
    imports: [],
    templateUrl: './on-time-delivery.component.html',
    styleUrl: './on-time-delivery.component.scss'
})
export class OnTimeDeliveryComponent {

    constructor(
        private onTimeDeliveryService: OnTimeDeliveryService
    ) {}

    ngOnInit(): void {
        this.onTimeDeliveryService.loadChart();
    }

}