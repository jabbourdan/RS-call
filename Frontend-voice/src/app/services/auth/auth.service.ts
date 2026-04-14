import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
    SignInRequest,
    AuthResponse,
    RefreshTokenResponse,
    CurrentUser,
} from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {

    private readonly ACCESS_TOKEN_KEY = 'access_token';
    private readonly USER_KEY         = 'auth_user';

    // ─── Signals ────────────────────────────────────────────────────────────────

    private _currentUser = signal<CurrentUser | null>(this.loadUserFromStorage());

    /** Publicly readable current user */
    readonly currentUser = this._currentUser.asReadonly();

    /** True if we have a stored access token */
    readonly isLoggedIn = computed(() => !!this.getAccessToken());

    // ─── Constructor ─────────────────────────────────────────────────────────────

    constructor(private http: HttpClient, private router: Router) {}

    // ─── Sign In ─────────────────────────────────────────────────────────────────

    signIn(credentials: SignInRequest): Observable<AuthResponse> {
        return this.http
            .post<AuthResponse>(`${environment.apiUrl}/auth/sign-in`, credentials, {
                withCredentials: true, // send/receive cookies (refresh token)
            })
            .pipe(
                tap((res) => this.handleAuthSuccess(res)),
                catchError((err) => throwError(() => err))
            );
    }

    // ─── Sign Out ────────────────────────────────────────────────────────────────

    signOut(): Observable<any> {
        return this.http
            .post(`${environment.apiUrl}/auth/sign-out`, {}, { withCredentials: true })
            .pipe(
                tap(() => this.clearSession()),
                catchError(() => {
                    // Even if the request fails, clear local session
                    this.clearSession();
                    return throwError(() => new Error('Sign out failed'));
                })
            );
    }

    // ─── Refresh Token ───────────────────────────────────────────────────────────

    refreshToken(): Observable<RefreshTokenResponse> {
        return this.http
            .post<RefreshTokenResponse>(
                `${environment.apiUrl}/auth/refresh`,
                {}, // refresh_token is sent automatically via httpOnly cookie
                { withCredentials: true }
            )
            .pipe(
                tap((res) => {
                    localStorage.setItem(this.ACCESS_TOKEN_KEY, res.access_token);
                }),
                catchError((err) => {
                    // Refresh failed – force sign out
                    this.clearSession();
                    this.router.navigate(['/authentication/sign-in']);
                    return throwError(() => err);
                })
            );
    }

    // ─── Get Current User (from API) ─────────────────────────────────────────────

    fetchCurrentUser(): Observable<CurrentUser> {
        return this.http
            .get<CurrentUser>(`${environment.apiUrl}/auth/me`, { withCredentials: true })
            .pipe(
                tap((user) => {
                    this._currentUser.set(user);
                    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
                }),
                catchError((err) => throwError(() => err))
            );
    }

    // ─── Token Helpers ───────────────────────────────────────────────────────────

    getAccessToken(): string | null {
        return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────────

    private handleAuthSuccess(res: AuthResponse): void {
        // Store access_token in localStorage only
        // refresh_token is set as httpOnly cookie by the backend — never touches JS
        localStorage.setItem(this.ACCESS_TOKEN_KEY, res.access_token);

        // Store minimal user info locally
        const userSnapshot: CurrentUser = {
            user_id: res.user_id,
            org_id: res.org_id,
            email: '',
            full_name: '',
            role: res.role,
            is_active: true,
            created_at: '',
        };
        this._currentUser.set(userSnapshot);
        localStorage.setItem(this.USER_KEY, JSON.stringify(userSnapshot));
    }

    private clearSession(): void {
        localStorage.removeItem(this.ACCESS_TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        this._currentUser.set(null);
    }

    private loadUserFromStorage(): CurrentUser | null {
        try {
            const raw = localStorage.getItem(this.USER_KEY);
            return raw ? (JSON.parse(raw) as CurrentUser) : null;
        } catch {
            return null;
        }
    }
}
