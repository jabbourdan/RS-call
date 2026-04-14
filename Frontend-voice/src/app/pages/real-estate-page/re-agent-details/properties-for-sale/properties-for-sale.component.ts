import { Component } from '@angular/core';
import { PropertiesForSaleService } from './properties-for-sale.service';

@Component({
    selector: 'app-properties-for-sale',
    imports: [],
    templateUrl: './properties-for-sale.component.html',
    styleUrl: './properties-for-sale.component.scss'
})
export class PropertiesForSaleComponent {

    constructor(
        private propertiesForSaleService: PropertiesForSaleService
    ) {}

    ngOnInit(): void {
        this.propertiesForSaleService.loadChart();
    }

}