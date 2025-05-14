// admin/employees/list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { Employee } from '@app/_models';
import { EmployeeService, AlertService } from '@app/_services';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
    employees: Employee[];

    constructor(
        private router: Router,
        private employeeService: EmployeeService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.employeeService.getAll()
            .pipe(first())
            .subscribe(employees => this.employees = employees);
    }

    deleteEmployee(id: number) {
        const employee = this.employees.find(x => x.id === id);
        // employee.isDeleting = true;
        this.employeeService.delete(id)
            .pipe(first())
            .subscribe(() => {
                this.employees = this.employees.filter(x => x.id !== id);
                this.alertService.success('Employee deleted successfully', { keepAfterRouteChange: true });
            });
    }
}