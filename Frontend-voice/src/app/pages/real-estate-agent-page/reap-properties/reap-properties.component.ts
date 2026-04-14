import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-reap-properties',
    imports: [RouterLink, FileUploadModule, TranslateModule],
    templateUrl: './reap-properties.component.html',
    styleUrl: './reap-properties.component.scss'
})
export class ReapPropertiesComponent {

    // Popup Trigger
    classApplied = false;
    toggleClass() {
        this.classApplied = !this.classApplied;
    }

}