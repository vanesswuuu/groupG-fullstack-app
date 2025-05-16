// admin/workflows/workflows-routing.module.ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListComponent } from './list.component';
import { OnboardingComponent } from './onboarding.component';
import { ViewComponent } from './view.component';

const routes: Routes = [
    { path: '', component: ListComponent },
    { path: 'onboarding', component: OnboardingComponent },
    { path: ':id', component: ViewComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class WorkflowsRoutingModule { }