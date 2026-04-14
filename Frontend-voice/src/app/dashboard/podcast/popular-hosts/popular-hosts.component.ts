import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-popular-hosts',
    imports: [RouterLink],
    templateUrl: './popular-hosts.component.html',
    styleUrl: './popular-hosts.component.scss'
})
export class PopularHostsComponent {}