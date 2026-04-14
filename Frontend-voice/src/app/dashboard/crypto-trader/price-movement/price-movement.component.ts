import { Component } from '@angular/core';
import { PriceMovementService } from './price-movement.service';

@Component({
    selector: 'app-price-movement',
    imports: [],
    templateUrl: './price-movement.component.html',
    styleUrl: './price-movement.component.scss'
})
export class PriceMovementComponent {

    constructor(
        private priceMovementService: PriceMovementService
    ) {}

    ngOnInit(): void {
        this.priceMovementService.loadCharts();
    }

}