import { Component } from '@angular/core';
import { CreditUtilizationRatioService } from './credit-utilization-ratio.service';

@Component({
    selector: 'app-credit-utilization-ratio',
    imports: [],
    templateUrl: './credit-utilization-ratio.component.html',
    styleUrl: './credit-utilization-ratio.component.scss'
})
export class CreditUtilizationRatioComponent {

    constructor(
        private creditUtilizationRatioService: CreditUtilizationRatioService
    ) {}

    ngOnInit(): void {
        this.creditUtilizationRatioService.loadChart();
    }

}