import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-app-settings',
    standalone: true,
    imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslateModule],
    templateUrl: './app-settings.component.html',
    styleUrl: './app-settings.component.scss'
})
export class AppSettingsComponent {}
