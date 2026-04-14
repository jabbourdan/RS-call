import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { CurrentUser } from './auth.models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthPollingService implements OnDestroy {

    private pollSub: Subscription | null = null;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {}

    start(): void {
        if (this.pollSub) return; // already running

        console.log('%c[AuthPolling] Started — polling /auth/me every 7s', 'color: #6366f1; font-weight: bold');

        this.pollSub = interval(7000).pipe(
            switchMap(() =>
                this.http.get<CurrentUser>(`${environment.apiUrl}/auth/me`, { withCredentials: true })
            )
        ).subscribe({
            next: (user) => {
                console.log('%c[AuthPolling] ✅ /auth/me success', 'color: #22c55e; font-weight: bold', user);
            },
            error: (err) => {
                console.warn('[AuthPolling] ❌ /auth/me failed — status:', err.status);
            }
        });
    }

    stop(): void {
        if (this.pollSub) {
            this.pollSub.unsubscribe();
            this.pollSub = null;
            console.log('%c[AuthPolling] Stopped', 'color: #f59e0b; font-weight: bold');
        }
    }

    ngOnDestroy(): void {
        this.stop();
    }
}
