import { Component, HostListener } from '@angular/core';
import { ProductTradeConditionsService } from './product-trade-conditions.service';

@Component({
    selector: 'app-product-trade-conditions',
    imports: [],
    templateUrl: './product-trade-conditions.component.html',
    styleUrl: './product-trade-conditions.component.scss'
})
export class ProductTradeConditionsComponent {

    constructor(
        private productTradeConditionsService: ProductTradeConditionsService
    ) {}

    ngOnInit(): void {
        this.productTradeConditionsService.loadChart();
    }
    
    // Card Header Menu
    isCardHeaderOpen = false;
    toggleCardHeaderMenu() {
        this.isCardHeaderOpen = !this.isCardHeaderOpen;
    }
    @HostListener('document:click', ['$event'])
    handleClickOutside(event: Event) {
        const target = event.target as HTMLElement;
        if (!target.closest('.trezo-card-dropdown')) {
            this.isCardHeaderOpen = false;
        }
    }

}