// admin/requests/requests-routing.module.ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListComponent } from './list.component';
import { ViewComponent } from './view.component';

const routes: Routes = [
    { path: '', component: ListComponent },
    { path: ':id', component: ViewComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class RequestsRoutingModule { }