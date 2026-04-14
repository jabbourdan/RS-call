import { Component } from '@angular/core';
import { SalesByGenderService } from './sales-by-gender.service';

@Component({
    selector: 'app-sales-by-gender',
    imports: [],
    templateUrl: './sales-by-gender.component.html',
    styleUrl: './sales-by-gender.component.scss'
})
export class SalesByGenderComponent {

    constructor(
        private salesByGenderService: SalesByGenderService
    ) {}

    ngOnInit(): void {
        this.salesByGenderService.loadChart();
    }

}