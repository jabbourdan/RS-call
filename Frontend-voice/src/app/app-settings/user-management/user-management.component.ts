import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface DummyUser {
    id: number;
    initials: string;
    avatarBg: string;
    name: string;
    email: string;
    role: 'Admin' | 'Agent' | 'Supervisor';
    status: 'Active' | 'Inactive';
}

@Component({
    selector: 'app-user-management',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './user-management.component.html',
    styleUrl: './user-management.component.scss'
})
export class UserManagementComponent {

    users: DummyUser[] = [
        {
            id: 1,
            initials: 'AJ',
            avatarBg: 'bg-primary-500',
            name: 'Alice Johnson',
            email: 'alice@example.com',
            role: 'Admin',
            status: 'Active'
        },
        {
            id: 2,
            initials: 'BK',
            avatarBg: 'bg-purple-500',
            name: 'Bob Kim',
            email: 'bob@example.com',
            role: 'Agent',
            status: 'Active'
        },
        {
            id: 3,
            initials: 'CM',
            avatarBg: 'bg-amber-500',
            name: 'Carol Martinez',
            email: 'carol@example.com',
            role: 'Supervisor',
            status: 'Active'
        },
        {
            id: 4,
            initials: 'DW',
            avatarBg: 'bg-rose-500',
            name: 'David Wilson',
            email: 'david@example.com',
            role: 'Agent',
            status: 'Inactive'
        }
    ];

    readonly roleBadgeClass: Record<DummyUser['role'], string> = {
        Admin:      'bg-primary-50 text-primary-500 dark:bg-[#ffffff14] dark:text-primary-400',
        Agent:      'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
        Supervisor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
    };

    readonly statusBadgeClass: Record<DummyUser['status'], string> = {
        Active:   'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
        Inactive: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
    };

    onAddUser(): void {
        console.log('[UserManagement] Add user clicked');
    }

    onEditUser(user: DummyUser): void {
        console.log('[UserManagement] Edit user', user.id);
    }

    onDeleteUser(user: DummyUser): void {
        console.log('[UserManagement] Delete user', user.id);
    }
}
