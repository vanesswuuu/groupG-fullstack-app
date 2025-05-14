// admin/employees/transfer.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { DepartmentService, EmployeeService, AlertService } from '@app/_services';
import { Department } from '@app/_models';

@Component({ templateUrl: 'transfer.component.html' })
export class TransferComponent implements OnInit {
    form: FormGroup;
    id: number;
    loading = false;
    submitted = false;
    departments: Department[];
    employee: any;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private departmentService: DepartmentService,
        private employeeService: EmployeeService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];

        this.form = this.formBuilder.group({
            departmentId: ['', Validators.required]
        });

        // Load departments for dropdown
        this.departmentService.getAll()
            .pipe(first())
            .subscribe(departments => this.departments = departments);

        // Load employee details
        this.employeeService.getById(this.id)
            .pipe(first())
            .subscribe(employee => {
                this.employee = employee;
                this.form.patchValue({ departmentId: employee.department?.id });
            });
    }

    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;
        this.alertService.clear();

        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        this.employeeService.transfer(this.id, this.form.value.departmentId)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Transfer successful', { keepAfterRouteChange: true });
                    this.router.navigate(['../../'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }
}