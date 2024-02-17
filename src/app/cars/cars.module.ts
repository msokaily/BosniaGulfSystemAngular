import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CarsPageRoutingModule } from './cars-routing.module';

import { CarsPage } from './cars.page';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedModule } from '../services/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CarsPageRoutingModule,
    TranslateModule,
    NgxDatatableModule,
    SharedModule
  ],
  declarations: [CarsPage]
})
export class CarsPageModule {}
