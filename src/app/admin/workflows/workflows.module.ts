// admin/workflows/workflows.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { WorkflowsRoutingModule } from './workflows-routing.module';
import { ListComponent } from './list.component';
import { OnboardingComponent } from './onboarding.component';
import { ViewComponent } from './view.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        WorkflowsRoutingModule
    ],
    declarations: [
        ListComponent,
        OnboardingComponent,
        ViewComponent
    ]
})
export class WorkflowsModule { }