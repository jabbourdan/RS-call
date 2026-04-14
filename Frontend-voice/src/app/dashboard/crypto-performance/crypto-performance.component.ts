import { Component } from '@angular/core';
import { PerformancePerInvestmentComponent } from './performance-per-investment/performance-per-investment.component';
import { PortfolioValueComponent } from './portfolio-value/portfolio-value.component';
import { CryptoMarketCapComponent } from './crypto-market-cap/crypto-market-cap.component';
import { TransactionsHistoryComponent } from './transactions-history/transactions-history.component';
import { MarketPerformanceComponent } from './market-performance/market-performance.component';
import { PerformanceMetricsComponent } from './performance-metrics/performance-metrics.component';
import { IndividualAssetPerformanceComponent } from './individual-asset-performance/individual-asset-performance.component';
import { RiskStabilityIndicatorsComponent } from './risk-stability-indicators/risk-stability-indicators.component';
import { ComparativeAnalysisComponent } from './comparative-analysis/comparative-analysis.component';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-crypto-performance',
    imports: [RouterLink, PerformancePerInvestmentComponent, PortfolioValueComponent, CryptoMarketCapComponent, TransactionsHistoryComponent, MarketPerformanceComponent, PerformanceMetricsComponent, IndividualAssetPerformanceComponent, RiskStabilityIndicatorsComponent, ComparativeAnalysisComponent],
    templateUrl: './crypto-performance.component.html',
    styleUrl: './crypto-performance.component.scss'
})
export class CryptoPerformanceComponent {}