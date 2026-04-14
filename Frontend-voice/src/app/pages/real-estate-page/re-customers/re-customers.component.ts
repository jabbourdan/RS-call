import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FileUploadModule } from '@iplab/ngx-file-upload';

@Component({
    selector: 'app-re-customers',
    imports: [RouterLink, FileUploadModule],
    templateUrl: './re-customers.component.html',
    styleUrl: './re-customers.component.scss'
})
export class ReCustomersComponent {

    // Popup Trigger
    classApplied = false;
    toggleClass() {
        this.classApplied = !this.classApplied;
    }

    // File Uploader
    public multiple: boolean = true;

}