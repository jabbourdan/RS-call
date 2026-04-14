import { Component } from '@angular/core';
import { StatsComponent } from './stats/stats.component';

@Component({
    selector: 'app-welcome',
    imports: [StatsComponent],
    templateUrl: './welcome.component.html',
    styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {}