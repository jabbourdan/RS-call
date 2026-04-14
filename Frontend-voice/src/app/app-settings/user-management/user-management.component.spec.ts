import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { UserManagementComponent } from './user-management.component';

describe('UserManagementComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                UserManagementComponent,
                TranslateModule.forRoot()
            ]
        }).compileComponents();
    });

    it('should create', () => {
        const fixture = TestBed.createComponent(UserManagementComponent);
        const component = fixture.componentInstance;
        expect(component).toBeTruthy();
    });

    it('should have exactly 4 dummy users', () => {
        const fixture = TestBed.createComponent(UserManagementComponent);
        const component = fixture.componentInstance;
        expect(component.users.length).toBe(4);
    });

    it('should render 4 user cards after detectChanges', () => {
        const fixture = TestBed.createComponent(UserManagementComponent);
        fixture.detectChanges();
        const compiled: HTMLElement = fixture.nativeElement;
        const cards = compiled.querySelectorAll('.grid > div');
        expect(cards.length).toBe(4);
    });

    it('should include at least one Admin role user', () => {
        const fixture = TestBed.createComponent(UserManagementComponent);
        const component = fixture.componentInstance;
        const admins = component.users.filter(u => u.role === 'Admin');
        expect(admins.length).toBeGreaterThan(0);
    });

    it('should include at least one Inactive user', () => {
        const fixture = TestBed.createComponent(UserManagementComponent);
        const component = fixture.componentInstance;
        const inactive = component.users.filter(u => u.status === 'Inactive');
        expect(inactive.length).toBeGreaterThan(0);
    });

    it('should call onAddUser without errors', () => {
        const fixture = TestBed.createComponent(UserManagementComponent);
        const component = fixture.componentInstance;
        expect(() => component.onAddUser()).not.toThrow();
    });

    it('should call onEditUser without errors', () => {
        const fixture = TestBed.createComponent(UserManagementComponent);
        const component = fixture.componentInstance;
        expect(() => component.onEditUser(component.users[0])).not.toThrow();
    });

    it('should call onDeleteUser without errors', () => {
        const fixture = TestBed.createComponent(UserManagementComponent);
        const component = fixture.componentInstance;
        expect(() => component.onDeleteUser(component.users[0])).not.toThrow();
    });
});
