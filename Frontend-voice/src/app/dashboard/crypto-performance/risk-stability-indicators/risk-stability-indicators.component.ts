import { Component } from '@angular/core';
import { RiskStabilityIndicatorsService } from './risk-stability-indicators.service';

@Component({
    selector: 'app-risk-stability-indicators',
    imports: [],
    templateUrl: './risk-stability-indicators.component.html',
    styleUrl: './risk-stability-indicators.component.scss'
})
export class RiskStabilityIndicatorsComponent {

    constructor(
        private riskStabilityIndicatorsService: RiskStabilityIndicatorsService
    ) {}

    ngOnInit(): void {
        this.riskStabilityIndicatorsService.loadChart();
    }

}