import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LanguageSwitchPage } from './language-switch.page';

const routes: Routes = [
  {
    path: '',
    component: LanguageSwitchPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LanguageSwitchPageRoutingModule {}
