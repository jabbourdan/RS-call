import { Component } from '@angular/core';
import { TradingVolumeService } from './trading-volume.service';

@Component({
    selector: 'app-trading-volume',
    imports: [],
    templateUrl: './trading-volume.component.html',
    styleUrl: './trading-volume.component.scss'
})
export class TradingVolumeComponent {

    constructor(
        private tradingVolumeService: TradingVolumeService
    ) {}

    ngOnInit(): void {
        this.tradingVolumeService.loadChart();
    }

}