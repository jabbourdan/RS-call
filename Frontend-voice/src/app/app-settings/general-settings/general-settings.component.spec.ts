import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GeneralSettingsComponent } from './general-settings.component';

describe('GeneralSettingsComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                GeneralSettingsComponent,
                FormsModule,
                TranslateModule.forRoot()
            ]
        }).compileComponents();
    });

    it('should create', () => {
        const fixture = TestBed.createComponent(GeneralSettingsComponent);
        const component = fixture.componentInstance;
        expect(component).toBeTruthy();
    });

    it('should initialise orgName to a non-empty string', () => {
        const fixture = TestBed.createComponent(GeneralSettingsComponent);
        const component = fixture.componentInstance;
        expect(component.orgName.length).toBeGreaterThan(0);
    });

    it('should default callingAlgorithm to "priority"', () => {
        const fixture = TestBed.createComponent(GeneralSettingsComponent);
        const component = fixture.componentInstance;
        expect(component.callingAlgorithm).toBe('priority');
    });

    it('should render at least 3 readonly inputs (plan + 2 phones)', () => {
        const fixture = TestBed.createComponent(GeneralSettingsComponent);
        fixture.detectChanges();
        const compiled: HTMLElement = fixture.nativeElement;
        const readonlyInputs = compiled.querySelectorAll('input[readonly]');
        expect(readonlyInputs.length).toBeGreaterThanOrEqual(3);
    });

    it('should call onSave without errors', () => {
        const fixture = TestBed.createComponent(GeneralSettingsComponent);
        const component = fixture.componentInstance;
        expect(() => component.onSave()).not.toThrow();
    });

    it('should call onCancel without errors', () => {
        const fixture = TestBed.createComponent(GeneralSettingsComponent);
        const component = fixture.componentInstance;
        expect(() => component.onCancel()).not.toThrow();
    });
});
