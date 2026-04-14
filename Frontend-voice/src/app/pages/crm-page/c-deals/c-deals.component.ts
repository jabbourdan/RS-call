import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FileUploadModule } from '@iplab/ngx-file-upload';

@Component({
    selector: 'app-c-deals',
    imports: [RouterLink, FileUploadModule],
    templateUrl: './c-deals.component.html',
    styleUrl: './c-deals.component.scss'
})
export class CDealsComponent {

    // New Popup Trigger
    classApplied = false;
    toggleClass() {
        this.classApplied = !this.classApplied;
    }

}