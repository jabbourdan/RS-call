import { Component } from '@angular/core';
import { PendingOrdersService } from './pending-orders.service';

@Component({
    selector: 'app-pending-orders',
    imports: [],
    templateUrl: './pending-orders.component.html',
    styleUrl: './pending-orders.component.scss'
})
export class PendingOrdersComponent {

    constructor(
        private pendingOrdersService: PendingOrdersService
    ) {}

    ngOnInit(): void {
        this.pendingOrdersService.loadChart();
    }

}