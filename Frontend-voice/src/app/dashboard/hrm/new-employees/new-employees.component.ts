import { Component } from '@angular/core';
import { NewEmployeesService } from './new-employees.service';

@Component({
    selector: 'app-new-employees',
    imports: [],
    templateUrl: './new-employees.component.html',
    styleUrl: './new-employees.component.scss'
})
export class NewEmployeesComponent {

    constructor(
        private newEmployeesService: NewEmployeesService
    ) {}

    ngOnInit(): void {
        this.newEmployeesService.loadChart();
    }

}