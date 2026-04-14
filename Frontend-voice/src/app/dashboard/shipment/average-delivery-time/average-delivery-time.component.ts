import { Component } from '@angular/core';
import { AverageDeliveryTimeService } from './average-delivery-time.service';

@Component({
    selector: 'app-average-delivery-time',
    imports: [],
    templateUrl: './average-delivery-time.component.html',
    styleUrl: './average-delivery-time.component.scss'
})
export class AverageDeliveryTimeComponent {

    constructor(
        private averageDeliveryTimeService: AverageDeliveryTimeService
    ) {}

    ngOnInit(): void {
        this.averageDeliveryTimeService.loadChart();
    }

}