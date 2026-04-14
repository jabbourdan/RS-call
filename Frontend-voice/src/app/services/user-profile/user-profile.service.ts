import { Injectable, signal, computed } from '@angular/core';
import { CurrentUser } from '../auth/auth.models';

@Injectable({ providedIn: 'root' })
export class UserProfileService {

    private readonly USER_KEY = 'auth_user';

    // ─── Signal holding the current user from localStorage ──────────────────────
    private _user = signal<CurrentUser | null>(this.loadFromStorage());

    /** Publicly readable user signal */
    readonly user = this._user.asReadonly();

    /** Derived signals for easy access */
    readonly fullName  = computed(() => this._user()?.full_name  || '');
    readonly email     = computed(() => this._user()?.email      || '');
    readonly role      = computed(() => this._user()?.role       || '');
    readonly userId    = computed(() => this._user()?.user_id    || '');
    readonly orgId     = computed(() => this._user()?.org_id     || '');
    readonly isActive  = computed(() => this._user()?.is_active  ?? false);

    /** Call this to re-sync from localStorage (e.g. after login) */
    refresh(): void {
        this._user.set(this.loadFromStorage());
    }

    private loadFromStorage(): CurrentUser | null {
        try {
            const raw = localStorage.getItem(this.USER_KEY);
            return raw ? (JSON.parse(raw) as CurrentUser) : null;
        } catch {
            return null;
        }
    }
}