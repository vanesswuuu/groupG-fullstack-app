// admin/requests/view.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';

import { RequestService, AlertService } from '@app/_services';

@Component({ templateUrl: 'view.component.html' })
export class ViewComponent implements OnInit {
    form: FormGroup;
    id: number;
    request: any;
    loading = false;
    submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private requestService: RequestService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];

        this.form = this.formBuilder.group({
            status: ['']
        });

        this.requestService.getById(this.id)
            .pipe(first())
            .subscribe(request => {
                this.request = request;
                this.form.patchValue({ status: request.status });
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
        this.requestService.update(this.id, { status: this.form.value.status })
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Request updated', { keepAfterRouteChange: true });
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }
}