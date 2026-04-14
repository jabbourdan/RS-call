import { Component } from '@angular/core';
import { ResignedEmployeesService } from './resigned-employees.service';

@Component({
    selector: 'app-resigned-employees',
    imports: [],
    templateUrl: './resigned-employees.component.html',
    styleUrl: './resigned-employees.component.scss'
})
export class ResignedEmployeesComponent {

    constructor(
        private resignedEmployeesService: ResignedEmployeesService
    ) {}

    ngOnInit(): void {
        this.resignedEmployeesService.loadChart();
    }

}