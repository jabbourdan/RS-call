import { Component } from '@angular/core';
import { OverviewComponent } from './overview/overview.component';
import { InboundCallsComponent } from './inbound-calls/inbound-calls.component';
import { OutboundCallsComponent } from './outbound-calls/outbound-calls.component';
import { AgentsPerformanceComponent } from './agents-performance/agents-performance.component';
import { GeographyComponent } from './geography/geography.component';
import { AgentAvgEarningsComponent } from './agent-avg-earnings/agent-avg-earnings.component';
import { RecentCallsComponent } from './recent-calls/recent-calls.component';

@Component({
    selector: 'app-call-center',
    imports: [OverviewComponent, InboundCallsComponent, OutboundCallsComponent, AgentsPerformanceComponent, GeographyComponent, AgentAvgEarningsComponent, RecentCallsComponent],
    templateUrl: './call-center.component.html',
    styleUrl: './call-center.component.scss'
})
export class CallCenterComponent {}