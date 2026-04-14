import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AppSettingsComponent } from './app-settings.component';

describe('AppSettingsComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                AppSettingsComponent,
                RouterTestingModule,
                TranslateModule.forRoot()
            ]
        }).compileComponents();
    });

    it('should create', () => {
        const fixture = TestBed.createComponent(AppSettingsComponent);
        const component = fixture.componentInstance;
        expect(component).toBeTruthy();
    });

    it('should render the General Settings tab link', () => {
        const fixture = TestBed.createComponent(AppSettingsComponent);
        fixture.detectChanges();
        const compiled: HTMLElement = fixture.nativeElement;
        const links = compiled.querySelectorAll('a[ng-reflect-router-link], a[routerlink]');
        const tabLinks = Array.from(links).filter(el =>
            el.getAttribute('ng-reflect-router-link')?.includes('general-settings') ||
            el.getAttribute('routerlink')?.includes('general-settings')
        );
        expect(tabLinks.length).toBeGreaterThan(0);
    });

    it('should render the User Management tab link', () => {
        const fixture = TestBed.createComponent(AppSettingsComponent);
        fixture.detectChanges();
        const compiled: HTMLElement = fixture.nativeElement;
        const links = compiled.querySelectorAll('a[ng-reflect-router-link], a[routerlink]');
        const tabLinks = Array.from(links).filter(el =>
            el.getAttribute('ng-reflect-router-link')?.includes('user-management') ||
            el.getAttribute('routerlink')?.includes('user-management')
        );
        expect(tabLinks.length).toBeGreaterThan(0);
    });
});
