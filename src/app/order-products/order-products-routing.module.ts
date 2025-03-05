import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrderProductsPage } from './order-products.page';

const routes: Routes = [
  {
    path: '',
    component: OrderProductsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderProductsPageRoutingModule {}
