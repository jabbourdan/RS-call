import { Component } from '@angular/core';
import { TotalIncomeComponent } from './total-income/total-income.component';
import { TotalExpensesComponent } from './total-expenses/total-expenses.component';
import { AccountsReceivableComponent } from './accounts-receivable/accounts-receivable.component';
import { AccountsPayableComponent } from './accounts-payable/accounts-payable.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { CashEndMonthComponent } from './cash-end-month/cash-end-month.component';
import { WeeklyExpensesComponent } from './weekly-expenses/weekly-expenses.component';
import { IncomeSourcesComponent } from './income-sources/income-sources.component';
import { NetProfitComponent } from './net-profit/net-profit.component';
import { TransactionsHistoryComponent } from './transactions-history/transactions-history.component';
import { CardComponent } from './card/card.component';
import { ExpenseBreakdownComponent } from './expense-breakdown/expense-breakdown.component';

@Component({
    selector: 'app-finance',
    imports: [TotalIncomeComponent, TotalExpensesComponent, AccountsReceivableComponent, AccountsPayableComponent, StatisticsComponent, CashEndMonthComponent, WeeklyExpensesComponent, IncomeSourcesComponent, NetProfitComponent, TransactionsHistoryComponent, CardComponent, ExpenseBreakdownComponent],
    templateUrl: './finance.component.html',
    styleUrl: './finance.component.scss'
})
export class FinanceComponent {}