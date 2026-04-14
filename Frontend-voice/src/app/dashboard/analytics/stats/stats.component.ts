import { Component } from '@angular/core';
import { NewRegistersService } from './new-registers.service';
import { WebsiteVisitsService } from './website-visits.service';

@Component({
    selector: 'app-stats',
    imports: [],
    templateUrl: './stats.component.html',
    styleUrl: './stats.component.scss'
})
export class StatsComponent {

    constructor(
        private newRegistersService: NewRegistersService,
        private websiteVisitsService: WebsiteVisitsService
    ) {}

    ngOnInit(): void {
        this.newRegistersService.loadChart();
        this.websiteVisitsService.loadChart();
    }

}