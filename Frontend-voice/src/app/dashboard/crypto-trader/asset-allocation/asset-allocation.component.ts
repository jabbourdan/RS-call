import { Component } from '@angular/core';
import { AssetAllocationService } from './asset-allocation.service';

@Component({
    selector: 'app-asset-allocation',
    imports: [],
    templateUrl: './asset-allocation.component.html',
    styleUrl: './asset-allocation.component.scss'
})
export class AssetAllocationComponent {

    constructor(
        private assetAllocationService: AssetAllocationService
    ) {}

    ngOnInit(): void {
        this.assetAllocationService.loadChart();
    }

}