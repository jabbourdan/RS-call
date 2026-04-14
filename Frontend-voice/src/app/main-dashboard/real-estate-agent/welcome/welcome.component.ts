import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-welcome',
    imports: [TranslateModule],
    templateUrl: './welcome.component.html',
    styleUrl: './welcome.component.scss'
})
export class WelcomeComponent implements OnInit {

    fullName: string = '';

    ngOnInit(): void {
        try {
            const raw = localStorage.getItem('auth_user');
            if (raw) {
                const user = JSON.parse(raw);
                this.fullName = user?.full_name || '';
            }
        } catch {
            this.fullName = '';
        }
    }
}