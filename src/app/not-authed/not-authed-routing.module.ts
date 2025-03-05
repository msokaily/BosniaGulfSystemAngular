import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotAuthedPage } from './not-authed.page';

const routes: Routes = [
  {
    path: '',
    component: NotAuthedPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotAuthedPageRoutingModule {}
