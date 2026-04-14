import { Component } from '@angular/core';
import { TasksOverviewService } from './tasks-overview.service';

@Component({
    selector: 'app-tasks-overview',
    imports: [],
    templateUrl: './tasks-overview.component.html',
    styleUrl: './tasks-overview.component.scss'
})
export class TasksOverviewComponent {

    constructor(
        private tasksOverviewService: TasksOverviewService
    ) {}

    ngOnInit(): void {
        this.tasksOverviewService.loadChart();
    }

}