import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FileUploadModule } from '@iplab/ngx-file-upload';

@Component({
    selector: 'app-d-write-prescription',
    imports: [RouterLink, FileUploadModule],
    templateUrl: './d-write-prescription.component.html',
    styleUrl: './d-write-prescription.component.scss'
})
export class DWritePrescriptionComponent {

    // File Uploader
    public multiple: boolean = true;

}