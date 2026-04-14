import { Component } from '@angular/core';
import { ClicksService } from './clicks.service';

@Component({
    selector: 'app-clicks',
    imports: [],
    templateUrl: './clicks.component.html',
    styleUrl: './clicks.component.scss'
})
export class ClicksComponent {

    constructor(
        private clicksService: ClicksService
    ) {}

    ngOnInit(): void {
        this.clicksService.loadChart();
    }

}