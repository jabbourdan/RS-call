import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PropertiesForSaleComponent } from './properties-for-sale/properties-for-sale.component';
import { PropertiesForRentComponent } from './properties-for-rent/properties-for-rent.component';

@Component({
    selector: 'app-re-agent-details',
    imports: [RouterLink, PropertiesForSaleComponent, PropertiesForRentComponent],
    templateUrl: './re-agent-details.component.html',
    styleUrl: './re-agent-details.component.scss'
})
export class ReAgentDetailsComponent {}