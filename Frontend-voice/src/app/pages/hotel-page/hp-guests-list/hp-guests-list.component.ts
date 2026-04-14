import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FileUploadModule } from '@iplab/ngx-file-upload';

@Component({
    selector: 'app-hp-guests-list',
    imports: [RouterLink, FileUploadModule],
    templateUrl: './hp-guests-list.component.html',
    styleUrl: './hp-guests-list.component.scss'
})
export class HpGuestsListComponent {

    // Popup Trigger
    classApplied = false;
    toggleClass() {
        this.classApplied = !this.classApplied;
    }

}