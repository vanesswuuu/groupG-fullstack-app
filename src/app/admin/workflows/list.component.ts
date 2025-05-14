// admin/workflows/list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { Employee } from '@app/_models';
import { EmployeeService, WorkflowService, AlertService } from '@app/_services';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
    employees: Employee[] = [];
    selectedEmployeeId: number | null = null;
    workflows: any[] = [];
    loading = false;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private employeeService: EmployeeService,
        private workflowService: WorkflowService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.loadEmployees();
        
        // Check for employeeId in query params
        this.route.queryParams.subscribe(params => {
            if (params['employeeId']) {
                this.onEmployeeSelect(Number(params['employeeId']));
            }
        });
    }

    loadEmployees() {
        this.loading = true;
        this.employeeService.getAll()
            .pipe(first())
            .subscribe({
                next: (employees) => {
                    this.employees = employees;
                    this.loading = false;
                },
                error: (error) => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }

    onEmployeeSelect(employeeId: number) {
        this.selectedEmployeeId = employeeId;
        this.loadWorkflows(employeeId);
        
        // Update URL with employeeId
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { employeeId },
            queryParamsHandling: 'merge'
        });
    }

    loadWorkflows(employeeId: number) {
        this.loading = true;
        this.workflowService.getByEmployee(employeeId)
            .pipe(first())
            .subscribe({
                next: (workflows) => {
                    this.workflows = workflows;
                    this.loading = false;
                },
                error: (error) => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }
}