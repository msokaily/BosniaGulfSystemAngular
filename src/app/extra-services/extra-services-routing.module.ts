import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExtraServicesPage } from './extra-services.page';

const routes: Routes = [
  {
    path: '',
    component: ExtraServicesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExtraServicesPageRoutingModule {}
