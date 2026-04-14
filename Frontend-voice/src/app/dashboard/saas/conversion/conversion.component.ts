import { Component } from '@angular/core';
import { ConversionService } from './conversion.service';

@Component({
    selector: 'app-conversion',
    imports: [],
    templateUrl: './conversion.component.html',
    styleUrl: './conversion.component.scss'
})
export class ConversionComponent {

    constructor(
        private conversionService: ConversionService
    ) {}

    ngOnInit(): void {
        this.conversionService.loadChart();
    }

}