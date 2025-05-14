// admin/requests/list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { Request } from '@app/_models';
import { RequestService, AlertService } from '@app/_services';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
    requests: Request[];

    constructor(
        private router: Router,
        private requestService: RequestService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.requestService.getAll()
            .pipe(first())
            .subscribe(requests => this.requests = requests);
    }
}