import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FpFooterComponent } from './common/fp-footer/fp-footer.component';
import { FpNavbarComponent } from './common/fp-navbar/fp-navbar.component';
import { ToggleService } from '../common/header/toggle.service';

@Component({
    selector: 'app-front-pages',
    imports: [RouterOutlet, FpNavbarComponent, FpFooterComponent],
    templateUrl: './front-pages.component.html',
    styleUrl: './front-pages.component.scss'
})
export class FrontPagesComponent {

    constructor(
        public toggleService: ToggleService
    ) {}

    ngOnInit(): void {
        // Initialize theme and direction on component load
        this.toggleService.initializeTheme();
    }

    // Toggle theme between light and dark
    toggleTheme() {
        this.toggleService.toggleTheme();
    }

    // Toggle direction between LTR and RTL
    toggleDirection() {
        this.toggleService.toggleDirection();
    }

}