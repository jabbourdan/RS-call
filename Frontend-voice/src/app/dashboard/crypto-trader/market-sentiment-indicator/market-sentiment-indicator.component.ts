import { Component } from '@angular/core';
import { MarketSentimentIndicatorService } from './market-sentiment-indicator.service';

@Component({
    selector: 'app-market-sentiment-indicator',
    imports: [],
    templateUrl: './market-sentiment-indicator.component.html',
    styleUrl: './market-sentiment-indicator.component.scss'
})
export class MarketSentimentIndicatorComponent {

    constructor(private marketSentimentIndicatorService: MarketSentimentIndicatorService) {}

    ngOnInit(): void {
        this.marketSentimentIndicatorService.loadChart();
    }

}