import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FileUploadModule } from '@iplab/ngx-file-upload';

@Component({
    selector: 'app-hp-rooms-list',
    imports: [RouterLink, FileUploadModule],
    templateUrl: './hp-rooms-list.component.html',
    styleUrl: './hp-rooms-list.component.scss'
})
export class HpRoomsListComponent {

    // Popup Trigger
    classApplied = false;
    toggleClass() {
        this.classApplied = !this.classApplied;
    }

}