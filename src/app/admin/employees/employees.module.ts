// admin/employees/employees.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { EmployeesRoutingModule } from './employees-routing.module';
import { ListComponent } from './list.component';
import { AddEditComponent } from './add-edit.component';
import { TransferComponent } from './transfer.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        EmployeesRoutingModule
    ],
    declarations: [
        ListComponent,
        AddEditComponent,
        TransferComponent
    ]
})
export class EmployeesModule { }