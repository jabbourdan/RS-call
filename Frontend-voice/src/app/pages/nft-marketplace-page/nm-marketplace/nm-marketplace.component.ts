import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CreatorsComponent } from './creators/creators.component';
import { FeaturedComponent } from './featured/featured.component';

@Component({
    selector: 'app-nm-marketplace',
    imports: [RouterLink, FeaturedComponent, CreatorsComponent],
    templateUrl: './nm-marketplace.component.html',
    styleUrl: './nm-marketplace.component.scss'
})
export class NmMarketplaceComponent {}