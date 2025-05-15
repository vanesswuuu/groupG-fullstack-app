import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { Request } from '@app/_models';
import { RequestService, EmployeeService, AlertService } from '@app/_services';

@Component({ templateUrl: 'add-edit.component.html' })
export class AddEditComponent implements OnInit {
    form: FormGroup;
    id: number;
    isAddMode: boolean;
    loading = false;
    submitted = false;
    employees: any[] = [];

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private requestService: RequestService,
        private employeeService: EmployeeService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.isAddMode = !this.id;

        // Load all employees
        this.employeeService.getAll()
            .pipe(first())
            .subscribe(employees => {
                this.employees = employees;
            });

        this.form = this.formBuilder.group({
            employeeId: ['', Validators.required], // ✅ Reactive control
            type: ['', Validators.required],
            status: ['pending', Validators.required],
            items: this.formBuilder.array([this.createItem()])
        });

        if (!this.isAddMode) {
            this.requestService.getById(this.id)
                .pipe(first())
                .subscribe(x => {
                    while (this.items.length) {
                        this.items.removeAt(0);
                    }

                    x.items.forEach(item => {
                        this.items.push(this.formBuilder.group(item));
                    });

                    this.form.patchValue(x);
                });
        }
    }

    // Convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    // Convenience getter for items FormArray
    get items() { return this.form.get('items') as FormArray; }

    createItem(): FormGroup {
        return this.formBuilder.group({
            name: ['', Validators.required],
            quantity: [1, [Validators.required, Validators.min(1)]],
            description: ['']
        });
    }

    addItem() {
        this.items.push(this.createItem());
    }

    removeItem(index: number) {
        this.items.removeAt(index);
    }

    onSubmit() {
        this.submitted = true;
        this.alertService.clear();

        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        if (this.isAddMode) {
            this.createRequest();
        } else {
            this.updateRequest();
        }
    }

    private createRequest() {
        this.requestService.create(this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Request created successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }

    private updateRequest() {
        this.requestService.update(this.id, this.form.value)
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