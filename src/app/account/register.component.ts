import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';
import { MustMatch } from '@app/_helpers';

interface RegisterResponse {
  message: string;
  isVerified: boolean;
}

@Component({
  templateUrl: 'register.component.html'
})
export class RegisterComponent implements OnInit {
  form: UntypedFormGroup;
  loading = false;
  submitted = false;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      title: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;
  
    // reset alerts on submit
    this.alertService.clear();
  
    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }
  
    this.loading = true;
    this.accountService.register(this.form.value)
      .pipe(first())
      .subscribe({
        next: (response: RegisterResponse) => {
          let message: string;

          console.log('Response isVerified: ', response.isVerified);
          if (response.isVerified) {
            message = 'Admin account registered. You can login right away.';
          } else {
            message = 'Registration successful, please check your email for verification instructions (Please check your spam email if it doesn\'t pop up in your primary).';
          }

          this.alertService.success(message, { keepAfterRouteChange: true });
          console.log('Register success');
          this.router.navigate(['../login'], { relativeTo: this.route });
        },
        error: error => {
          this.alertService.error(error);
          console.log('Register failed', error);
          this.loading = false;
        }
      });
  }
}