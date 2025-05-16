// admin/departments/list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { Department } from '@app/_models';
import { DepartmentService, AlertService } from '@app/_services';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
    departments: Department[];

    constructor(
        private router: Router,
        private departmentService: DepartmentService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.departmentService.getAll()
            .pipe(first())
            .subscribe(departments => this.departments = departments);
    }

    deleteDepartment(id: number) {
        const department = this.departments.find(x => x.id === id);
        // department.isDeleting = true;
        this.departmentService.delete(id)
            .pipe(first())
            .subscribe(() => {
                this.departments = this.departments.filter(x => x.id !== id);
                this.alertService.success('Department deleted successfully', { keepAfterRouteChange: true });
            });
    }
}