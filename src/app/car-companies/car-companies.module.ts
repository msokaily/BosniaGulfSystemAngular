import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CarCompaniesPageRoutingModule } from './car-companies-routing.module';

import { CarCompaniesPage } from './car-companies.page';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../services/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CarCompaniesPageRoutingModule,
    NgxDatatableModule,
    TranslateModule,
    SharedModule
  ],
  declarations: [CarCompaniesPage]
})
export class CarCompaniesPageModule {}
