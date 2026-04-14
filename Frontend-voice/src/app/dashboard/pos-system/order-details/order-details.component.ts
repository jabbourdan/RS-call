import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QuantityCounterComponent } from './quantity-counter/quantity-counter.component';

@Component({
    selector: 'app-order-details',
    imports: [RouterLink, QuantityCounterComponent],
    templateUrl: './order-details.component.html',
    styleUrl: './order-details.component.scss'
})
export class OrderDetailsComponent {}