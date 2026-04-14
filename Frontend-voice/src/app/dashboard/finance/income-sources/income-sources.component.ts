import { Component } from '@angular/core';
import { IncomeSourcesService } from './income-sources.service';

@Component({
    selector: 'app-income-sources',
    imports: [],
    templateUrl: './income-sources.component.html',
    styleUrl: './income-sources.component.scss'
})
export class IncomeSourcesComponent {

    constructor(
        private incomeSourcesService: IncomeSourcesService
    ) {}

    ngOnInit(): void {
        this.incomeSourcesService.loadChart();
    }

}