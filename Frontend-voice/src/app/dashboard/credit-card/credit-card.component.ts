import { Component } from '@angular/core';
import { MyCardsComponent } from './my-cards/my-cards.component';
import { TotalBalanceComponent } from './total-balance/total-balance.component';
import { TotalExpenseComponent } from './total-expense/total-expense.component';
import { CardsWithAmountComponent } from './cards-with-amount/cards-with-amount.component';
import { DailyLimitComponent } from './daily-limit/daily-limit.component';
import { QuickTransferComponent } from './quick-transfer/quick-transfer.component';
import { RecentTransactionsComponent } from './recent-transactions/recent-transactions.component';
import { CreditUtilizationRatioComponent } from './credit-utilization-ratio/credit-utilization-ratio.component';
import { MonthlySpendingComponent } from './monthly-spending/monthly-spending.component';
import { SpendingBreakdownComponent } from './spending-breakdown/spending-breakdown.component';
import { InterestChargeFeesComponent } from './interest-charge-fees/interest-charge-fees.component';
import { StatisticsComponent } from './statistics/statistics.component';

@Component({
    selector: 'app-credit-card',
    imports: [MyCardsComponent, TotalBalanceComponent, TotalExpenseComponent, CardsWithAmountComponent, DailyLimitComponent, QuickTransferComponent, RecentTransactionsComponent, CreditUtilizationRatioComponent, MonthlySpendingComponent, SpendingBreakdownComponent, InterestChargeFeesComponent, StatisticsComponent],
    templateUrl: './credit-card.component.html',
    styleUrl: './credit-card.component.scss'
})
export class CreditCardComponent {}