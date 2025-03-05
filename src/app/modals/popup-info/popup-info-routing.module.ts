import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PopupInfoPage } from './popup-info.page';

const routes: Routes = [
  {
    path: '',
    component: PopupInfoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PopupInfoPageRoutingModule {}
