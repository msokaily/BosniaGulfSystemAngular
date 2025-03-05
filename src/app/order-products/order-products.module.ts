import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrderProductsPageRoutingModule } from './order-products-routing.module';

import { OrderProductsPage } from './order-products.page';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedModule } from '../services/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    NgxDatatableModule,
    SharedModule,
    OrderProductsPageRoutingModule
  ],
  declarations: [OrderProductsPage],
  exports: [OrderProductsPage]
})
export class OrderProductsPageModule {}
