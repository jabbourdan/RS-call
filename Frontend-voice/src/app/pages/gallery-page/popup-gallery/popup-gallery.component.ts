import { Component } from '@angular/core';
import { Lightbox, LightboxModule } from 'ngx-lightbox';

@Component({
    selector: 'app-popup-gallery',
    imports: [LightboxModule],
    templateUrl: './popup-gallery.component.html',
    styleUrl: './popup-gallery.component.scss'
})
export class PopupGalleryComponent {

    public _album: { src: string, caption: string, thumb: string }[] = [];
    constructor(public _lightbox: Lightbox) {
        for (let i = 1; i <= 9; i++) {
            const src = 'images/gallery/gallery' + i + '.jpg';
            const caption = 'Image ' + i;
            const thumb = 'images/gallery/gallery' + i + '.jpg';
            const album = {
                src: src,
                caption: caption,
                thumb: thumb
            };
            this._album.push(album);
        }
    }
 
    open(index: number): void {
        // open lightbox
        this._lightbox.open(this._album, index);
    }
    
    close(): void {
        // close lightbox programmatically
        this._lightbox.close();
    }

}