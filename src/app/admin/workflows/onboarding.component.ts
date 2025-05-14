// admin/workflows/onboarding.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';

import { EmployeeService, WorkflowService, AlertService } from '@app/_services';

@Component({ templateUrl: 'onboarding.component.html' })
export class OnboardingComponent implements OnInit {
    form: FormGroup;
    loading = false;
    submitted = false;
    employees: any[];

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private employeeService: EmployeeService,
        private workflowService: WorkflowService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.form = this.formBuilder.group({
            employeeId: ['', []],
            details: ['']
        });

        // Load employees for dropdown
        this.employeeService.getAll()
            .pipe(first())
            .subscribe(employees => this.employees = employees);
    }

    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;
        this.alertService.clear();

        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        this.workflowService.initiateOnboarding(this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Onboarding workflow initiated', { keepAfterRouteChange: true });
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }
}