import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CarCompaniesPage } from './car-companies.page';

const routes: Routes = [
  {
    path: '',
    component: CarCompaniesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CarCompaniesPageRoutingModule {}
