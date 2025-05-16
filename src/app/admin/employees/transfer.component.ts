// admin/employees/transfer.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { DepartmentService, EmployeeService, AlertService, WorkflowService } from '@app/_services';
import { Department } from '@app/_models';

@Component({ templateUrl: 'transfer.component.html' })
export class TransferComponent implements OnInit {
    form: FormGroup;
    id: number;
    loading = false;
    submitted = false;
    departments: Department[];
    employee: any;
    oldDepartmentId: number;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private departmentService: DepartmentService,
        private employeeService: EmployeeService,
        private alertService: AlertService,
        private workflowService: WorkflowService
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
                this.oldDepartmentId = employee.department?.id;
                this.form.patchValue({ departmentId: this.oldDepartmentId });
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
        const newDepartmentId = this.form.value.departmentId;
        
        this.employeeService.transfer(this.id, newDepartmentId)
            .pipe(first())
            .subscribe({
                next: () => {
                    // Create workflow record after successful transfer
                    this.createTransferWorkflow(newDepartmentId);
                    
                    this.alertService.success('Transfer successful', { keepAfterRouteChange: true });
                    this.router.navigate(['../../'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }

    private createTransferWorkflow(newDepartmentId: number) {
        const oldDeptName = this.departments.find(d => d.id === this.oldDepartmentId)?.name || 'Unknown';
        const newDeptName = this.departments.find(d => d.id === newDepartmentId)?.name || 'Unknown';
        
        const workflowParams = {
            type: 'Transfer',
            status: 'completed',
            details: {
                message: `Employee transfer completed`,
                employeeId: this.id,
                fromDepartment: {
                    id: this.oldDepartmentId,
                    name: oldDeptName
                },
                toDepartment: {
                    id: newDepartmentId,
                    name: newDeptName
                },
                timestamp: new Date().toISOString()
            },
            employeeId: this.id
        };

        console.log('Creating workflow with params:', workflowParams);

        this.workflowService.create(workflowParams)
            .pipe(first())
            .subscribe({
                next: () => console.log('Workflow record created for transfer'),
                error: error => console.error('Error creating workflow record', error)
            });
    }
}