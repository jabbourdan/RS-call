import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-lead-status-list',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    templateUrl: './lead-status-list.component.html',
})
export class LeadStatusListComponent {
    @Input() statuses: string[] = [];
    @Output() statusesChange = new EventEmitter<string[]>();

    draftInput = '';
    error: string | null = null;

    add(): void {
        const value = this.draftInput.trim();
        if (!value) {
            this.error = 'CAMPAIGNS.STATUSES_ERROR_EMPTY';
            return;
        }
        if (this.statuses.includes(value)) {
            this.error = 'CAMPAIGNS.STATUSES_ERROR_DUPLICATE';
            return;
        }
        this.error = null;
        this.draftInput = '';
        this.statusesChange.emit([...this.statuses, value]);
    }

    remove(index: number): void {
        if (this.statuses.length <= 1) {
            this.error = 'CAMPAIGNS.STATUSES_ERROR_MIN_ONE';
            return;
        }
        this.error = null;
        const updated = [...this.statuses];
        updated.splice(index, 1);
        this.statusesChange.emit(updated);
    }

    moveUp(index: number): void {
        if (index === 0) { return; }
        const updated = [...this.statuses];
        [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
        this.statusesChange.emit(updated);
    }

    moveDown(index: number): void {
        if (index === this.statuses.length - 1) { return; }
        const updated = [...this.statuses];
        [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
        this.statusesChange.emit(updated);
    }

    onKeydown(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.add();
        }
    }
}
