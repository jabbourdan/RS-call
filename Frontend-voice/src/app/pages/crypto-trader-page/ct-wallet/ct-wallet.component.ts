import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-ct-wallet',
    imports: [RouterLink],
    templateUrl: './ct-wallet.component.html',
    styleUrl: './ct-wallet.component.scss'
})
export class CtWalletComponent {

    // Popup Trigger
    classApplied = false;
    toggleClass() {
        this.classApplied = !this.classApplied;
    }

}