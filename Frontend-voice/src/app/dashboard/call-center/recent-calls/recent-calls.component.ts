import { Component, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-recent-calls',
    imports: [RouterLink],
    templateUrl: './recent-calls.component.html',
    styleUrl: './recent-calls.component.scss'
})
export class RecentCallsComponent {
    
    // Card Header Menu
    isCardHeaderOpen = false;
    toggleCardHeaderMenu() {
        this.isCardHeaderOpen = !this.isCardHeaderOpen;
    }
    @HostListener('document:click', ['$event'])
    handleClickOutside(event: Event) {
        const target = event.target as HTMLElement;
        if (!target.closest('.trezo-card-dropdown')) {
            this.isCardHeaderOpen = false;
        }
    }

    // Table Sorting
    sortColumn: number = -1;
    sortOrder: 'asc' | 'desc' = 'asc';
    sortTable(columnIndex: number): void {
        const table = document.getElementById('sortingTable') as HTMLTableElement;
        const rows = Array.from(table.querySelectorAll('tbody tr'));
        // Toggle sort order
        if (this.sortColumn === columnIndex) {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = columnIndex;
            this.sortOrder = 'asc';
        }
        // Sort rows based on the column index
        rows.sort((rowA, rowB) => {
            const cellA = rowA.children[columnIndex].textContent!.trim();
            const cellB = rowB.children[columnIndex].textContent!.trim();

            // Determine sorting
            if (this.isNumeric(cellA) && this.isNumeric(cellB)) {
                const numA = parseFloat(cellA);
                const numB = parseFloat(cellB);
                return this.sortOrder === 'asc' ? numA - numB : numB - numA;
            } else {
                return this.sortOrder === 'asc'
                ? cellA.localeCompare(cellB)
                : cellB.localeCompare(cellA);
            }
        });
        // Reorder rows in the table
        const tbody = table.querySelector('tbody')!;
        rows.forEach((row) => tbody.appendChild(row));
    }
    private isNumeric(value: string): boolean {
        return !isNaN(parseFloat(value)) && isFinite(parseFloat(value));
    }

}