import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DynamicFormPage } from './dynamic-form.page';

const routes: Routes = [
  {
    path: '',
    component: DynamicFormPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DynamicFormPageRoutingModule {}
