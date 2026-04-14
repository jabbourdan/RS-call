import { Component } from '@angular/core';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { PriceStatisticsComponent } from './price-statistics/price-statistics.component';
import { ExchangeComponent } from './exchange/exchange.component';
import { TransactionsHistoryComponent } from './transactions-history/transactions-history.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { RankingsComponent } from './rankings/rankings.component';

@Component({
    selector: 'app-crypto',
    imports: [WatchlistComponent, PriceStatisticsComponent, ExchangeComponent, TransactionsHistoryComponent, PortfolioComponent, RankingsComponent],
    templateUrl: './crypto.component.html',
    styleUrl: './crypto.component.scss'
})
export class CryptoComponent {}