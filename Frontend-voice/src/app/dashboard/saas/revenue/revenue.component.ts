import { Component } from '@angular/core';
import { RevenueService } from './revenue.service';

@Component({
    selector: 'app-revenue',
    imports: [],
    templateUrl: './revenue.component.html',
    styleUrl: './revenue.component.scss'
})
export class RevenueComponent {

    constructor(
        private revenueService: RevenueService
    ) {}

    ngOnInit(): void {
        this.revenueService.loadChart();
    }

}