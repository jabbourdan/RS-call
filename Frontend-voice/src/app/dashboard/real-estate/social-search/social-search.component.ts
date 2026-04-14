import { Component } from '@angular/core';
import { SocialSearchService } from './social-search.service';

@Component({
    selector: 'app-social-search',
    imports: [],
    templateUrl: './social-search.component.html',
    styleUrl: './social-search.component.scss'
})
export class SocialSearchComponent {

    constructor(
        private socialSearchService: SocialSearchService
    ) {}

    ngOnInit(): void {
        this.socialSearchService.loadChart();
    }

}