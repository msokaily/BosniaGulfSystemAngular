import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChooseTimePage } from './choose-time.page';

const routes: Routes = [
  {
    path: '',
    component: ChooseTimePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChooseTimePageRoutingModule {}
