import { Component } from '@angular/core';
import { StatsComponent } from './stats/stats.component';
import { PriceMovementComponent } from './price-movement/price-movement.component';
import { TradingVolumeComponent } from './trading-volume/trading-volume.component';
import { PortfolioDistributionComponent } from './portfolio-distribution/portfolio-distribution.component';
import { ProfitLossComponent } from './profit-loss/profit-loss.component';
import { RiskExposureComponent } from './risk-exposure/risk-exposure.component';
import { LivePriceTrackerComponent } from './live-price-tracker/live-price-tracker.component';
import { RecentTransactionsComponent } from './recent-transactions/recent-transactions.component';
import { TradesPerMonthComponent } from './trades-per-month/trades-per-month.component';
import { AssetAllocationComponent } from './asset-allocation/asset-allocation.component';
import { GainersLosersComponent } from './gainers-losers/gainers-losers.component';
import { MarketSentimentIndicatorComponent } from './market-sentiment-indicator/market-sentiment-indicator.component';

@Component({
    selector: 'app-crypto-trader',
    imports: [StatsComponent, PriceMovementComponent, TradingVolumeComponent, PortfolioDistributionComponent, ProfitLossComponent, RiskExposureComponent, LivePriceTrackerComponent, RecentTransactionsComponent, TradesPerMonthComponent, AssetAllocationComponent, GainersLosersComponent, MarketSentimentIndicatorComponent],
    templateUrl: './crypto-trader.component.html',
    styleUrl: './crypto-trader.component.scss'
})
export class CryptoTraderComponent {}