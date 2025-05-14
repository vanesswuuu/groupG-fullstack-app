// admin/requests/requests.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { RequestsRoutingModule } from './requests-routing.module';
import { ListComponent } from './list.component';
import { ViewComponent } from './view.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        RequestsRoutingModule
    ],
    declarations: [
        ListComponent,
        ViewComponent
    ]
})
export class RequestsModule { }