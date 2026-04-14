import { Component } from '@angular/core';
import { CardsWithAmountService } from './cards-with-amount.service';

@Component({
    selector: 'app-cards-with-amount',
    imports: [],
    templateUrl: './cards-with-amount.component.html',
    styleUrl: './cards-with-amount.component.scss'
})
export class CardsWithAmountComponent {

    constructor(
        private cardsWithAmountService: CardsWithAmountService
    ) {}

    ngOnInit(): void {
        this.cardsWithAmountService.loadChart();
    }

}