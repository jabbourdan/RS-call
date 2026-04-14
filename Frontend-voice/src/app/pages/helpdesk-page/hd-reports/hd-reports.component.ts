import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TicketsStatusComponent } from './tickets-status/tickets-status.component';
import { CustomerSatisfactionComponent } from './customer-satisfaction/customer-satisfaction.component';
import { ResponseTimeComponent } from './response-time/response-time.component';
import { NewTicketsSolvedTicketsComponent } from './new-tickets-solved-tickets/new-tickets-solved-tickets.component';
import { PerformanceOfAgentsComponent } from '../../../dashboard/helpdesk/performance-of-agents/performance-of-agents.component';

@Component({
    selector: 'app-hd-reports',
    imports: [RouterLink, TicketsStatusComponent, CustomerSatisfactionComponent, ResponseTimeComponent, NewTicketsSolvedTicketsComponent, PerformanceOfAgentsComponent],
    templateUrl: './hd-reports.component.html',
    styleUrl: './hd-reports.component.scss'
})
export class HdReportsComponent {}