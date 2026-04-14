import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgxEditorModule } from 'ngx-editor';
import { FileUploadModule } from '@iplab/ngx-file-upload';

@Component({
    selector: 'app-add-user',
    imports: [RouterLink, NgxEditorModule, FileUploadModule],
    templateUrl: './add-user.component.html',
    styleUrl: './add-user.component.scss'
})
export class AddUserComponent {}