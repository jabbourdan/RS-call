import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FileUploadModule } from '@iplab/ngx-file-upload';

@Component({
    selector: 'app-my-drive',
    imports: [RouterLink, FileUploadModule],
    templateUrl: './my-drive.component.html',
    styleUrl: './my-drive.component.scss'
})
export class MyDriveComponent {

    // Popup Trigger
    classApplied = false;
    toggleClass() {
        this.classApplied = !this.classApplied;
    }

}