import { Component } from '@angular/core';
import { ReRevenueService } from './re-revenue.service';

@Component({
    selector: 'app-re-revenue',
    imports: [],
    templateUrl: './re-revenue.component.html',
    styleUrl: './re-revenue.component.scss'
})
export class ReRevenueComponent {

	constructor(
		private reRevenueService: ReRevenueService
	) {}

	ngOnInit(): void {
		this.reRevenueService.loadChart();
	}

}