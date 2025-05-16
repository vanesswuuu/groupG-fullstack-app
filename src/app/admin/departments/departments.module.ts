// admin/departments/departments.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DepartmentsRoutingModule } from './departments-routing.module';
import { ListComponent } from './list.component';
import { AddEditComponent } from './add-edit.component';
import { LayoutComponent } from '../layout.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        DepartmentsRoutingModule
    ],
    declarations: [
        ListComponent,
        AddEditComponent
    ]
})
export class DepartmentsModule { }