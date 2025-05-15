// admin/workflows/view.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';

import { WorkflowService, AlertService } from '@app/_services';

@Component({ templateUrl: 'view.component.html' })
export class ViewComponent implements OnInit {
    form: FormGroup;
    id: number;
    workflow: any;
    loading = false;
    submitted = false;
    employeeId: number | null = null;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private workflowService: WorkflowService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        
        // Get employeeId from query params if available
        this.route.queryParams.subscribe(params => {
            this.employeeId = params['employeeId'] ? Number(params['employeeId']) : null;
        });

        this.form = this.formBuilder.group({
            status: ['']
        });

        // Since we don't have getById in workflowService, we'll use getByEmployee
        // and filter the specific workflow (this is a workaround)
        if (this.employeeId) {
            this.loading = true;
            this.workflowService.getByEmployee(this.employeeId)
                .pipe(first())
                .subscribe({
                    next: (workflows) => {
                        console.log('Route ID:', this.id);
                        console.log('All workflows:', workflows);
                    
                        this.workflow = workflows.find(w => w.id == this.id);
                    
                        console.log('Found workflow:', this.workflow); // <-- Add this line
                    
                        if (this.workflow) {
                            console.log('Workflow exists, patching form');
                            this.form.patchValue({ status: this.workflow.status });
                        } else {
                            this.alertService.error('Workflow not found in list');
                        }
                    
                        this.loading = false;
                    },
                    error: (error) => {
                        this.alertService.error(error);
                        this.loading = false;
                    }
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
        this.workflowService.updateStatus(this.id, this.form.value.status)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Workflow updated', { keepAfterRouteChange: true });
                    // Navigate back to list with employeeId if available
                    const queryParams = this.employeeId ? { employeeId: this.employeeId } : {};
                    this.router.navigate(['../../'], { 
                        relativeTo: this.route, 
                        queryParams 
                    });
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }
}