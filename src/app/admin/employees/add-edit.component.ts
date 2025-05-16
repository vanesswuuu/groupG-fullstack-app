// admin/employees/add-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { Employee } from '@app/_models';

import { AccountService, DepartmentService, EmployeeService, AlertService } from '@app/_services';
import { Account, Department } from '@app/_models';

import { WorkflowService } from '@app/_services';
@Component({ templateUrl: 'add-edit.component.html' })
export class AddEditComponent implements OnInit {
    form: FormGroup;
    id: number;
    isAddMode: boolean;
    loading = false;
    submitted = false;
    accounts: Account[];
    departments: Department[];

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private departmentService: DepartmentService,
        private employeeService: EmployeeService,
        private alertService: AlertService,
        private workflowService: WorkflowService 
    ) { }

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.isAddMode = !this.id;

        this.form = this.formBuilder.group({
            employeeId: ['', Validators.required],
            userId: ['', Validators.required],
            position: ['', Validators.required],
            hireDate: ['', Validators.required],
            departmentId: ['', Validators.required],
            status: ['active']
        });

        // Load accounts and departments for dropdowns
        this.accountService.getAll()
            .pipe(first())
            .subscribe(accounts => this.accounts = accounts);

        this.departmentService.getAll()
            .pipe(first())
            .subscribe(departments => this.departments = departments);

        if (!this.isAddMode) {
            this.employeeService.getById(this.id)
                .pipe(first())
                .subscribe(x => {
                    this.form.patchValue(x);
                });
        }
    }

    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;
        this.alertService.clear();

        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        if (this.isAddMode) {
            this.createEmployee();
        } else {
            this.updateEmployee();
        }
    }

    private createEmployee() {
        this.employeeService.create(this.form.value)
            .pipe(first())
            .subscribe({
                next: (createdEmployee) => {
                    this.alertService.success('Employee created successfully', { keepAfterRouteChange: true });
                    
                    // Create onboarding workflow
                    this.createOnboardingWorkflow(createdEmployee);
                    
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }

    private createOnboardingWorkflow(employee: Employee) {
        const workflowParams = {
            employeeId: employee.id,
            details: {
                message: `Onboarding initiated for new employee ${employee.employeeId}`,
                position: employee.position,
                department: employee.department?.name || 'Unknown',
                hireDate: employee.hireDate,
                timestamp: new Date().toISOString()
            }
        };

        console.log('Creating onboarding workflow with params:', workflowParams);

        this.workflowService.initiateOnboarding(workflowParams)
            .pipe(first())
            .subscribe({
                next: () => console.log('Onboarding workflow created successfully'),
                error: error => console.error('Error creating onboarding workflow', error)
            });
    }

    private updateEmployee() {
        this.employeeService.update(this.id, this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Update successful', { keepAfterRouteChange: true });
                    this.router.navigate(['../../'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }
}