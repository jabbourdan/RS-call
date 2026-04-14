import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FileUploadModule } from '@iplab/ngx-file-upload';

@Component({
    selector: 'app-r-menus',
    imports: [RouterLink, FileUploadModule],
    templateUrl: './r-menus.component.html',
    styleUrl: './r-menus.component.scss'
})
export class RMenusComponent {

    // New Popup Trigger
    classApplied = false;
    toggleClass() {
        this.classApplied = !this.classApplied;
    }

}