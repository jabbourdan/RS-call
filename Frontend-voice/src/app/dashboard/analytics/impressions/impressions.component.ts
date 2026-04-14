import { Component } from '@angular/core';
import { ImpressionsService } from './impressions.service';

@Component({
    selector: 'app-impressions',
    imports: [],
    templateUrl: './impressions.component.html',
    styleUrl: './impressions.component.scss'
})
export class ImpressionsComponent {

    constructor(
        private impressionsService: ImpressionsService
    ) {}

    ngOnInit(): void {
        this.impressionsService.loadChart();
    }

}