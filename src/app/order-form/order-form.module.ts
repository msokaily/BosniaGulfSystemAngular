import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrderFormPageRoutingModule } from './order-form-routing.module';

import { OrderFormPage } from './order-form.page';
import { TranslateModule } from '@ngx-translate/core';
import { DynamicFormPageModule } from '../dynamic-form/dynamic-form.module';
import { OrderProductsPageModule } from '../order-products/order-products.module';
import { SharedModule } from '../services/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    OrderFormPageRoutingModule,
    DynamicFormPageModule,
    SharedModule,
    OrderProductsPageModule
  ],
  declarations: [OrderFormPage]
})
export class OrderFormPageModule {}
