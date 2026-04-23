import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { AuthService } from '../../services/auth/auth.service';
import { CurrentUser, UserRole } from '../../services/auth/auth.models';

const ROLE_BADGE: Record<UserRole, string> = {
    owner: 'bg-primary-50 text-primary-500 dark:bg-[#ffffff14] dark:text-primary-400',
    admin: 'bg-primary-50 text-primary-500 dark:bg-[#ffffff14] dark:text-primary-400',
    member: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    viewer: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
};

const AVATAR_COLORS = [
    'bg-primary-500',
    'bg-purple-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-teal-500',
    'bg-indigo-500',
];

@Component({
    selector: 'app-user-management',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './user-management.component.html',
    styleUrl: './user-management.component.scss',
})
export class UserManagementComponent implements OnInit {
    private readonly authService = inject(AuthService);

    users: CurrentUser[] = [];
    isLoading = false;
    errorMessage = '';

    readonly roleBadgeClass = ROLE_BADGE;
    readonly statusBadgeClass = {
        active: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
        inactive: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    };

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers(): void {
        this.isLoading = true;
        this.errorMessage = '';
        this.authService.getOrgUsers().subscribe({
            next: (users) => {
                this.users = users;
                this.isLoading = false;
            },
            error: (err) => {
                this.errorMessage = this.extractError(err);
                this.isLoading = false;
            },
        });
    }

    initials(fullName: string | null | undefined): string {
        const name = (fullName ?? '').trim();
        if (!name) return '?';
        const parts = name.split(/\s+/);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    avatarColor(userId: string): string {
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
        }
        return AVATAR_COLORS[hash % AVATAR_COLORS.length];
    }

    roleKey(role: UserRole): string {
        switch (role) {
            case 'owner':
                return 'APP_SETTINGS.USERS_ROLE_OWNER';
            case 'admin':
                return 'APP_SETTINGS.USERS_ROLE_ADMIN';
            case 'member':
                return 'APP_SETTINGS.USERS_ROLE_MEMBER';
            case 'viewer':
                return 'APP_SETTINGS.USERS_ROLE_VIEWER';
        }
    }

    trackByUserId(_: number, u: CurrentUser): string {
        return u.user_id;
    }

    private extractError(err: any): string {
        if (err?.error?.detail) {
            if (Array.isArray(err.error.detail)) {
                return err.error.detail
                    .map((e: any) => e.msg ?? JSON.stringify(e))
                    .join(', ');
            }
            return err.error.detail;
        }
        return err?.message ?? 'An unexpected error occurred.';
    }
}
