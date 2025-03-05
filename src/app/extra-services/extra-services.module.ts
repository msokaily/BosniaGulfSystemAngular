import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExtraServicesPageRoutingModule } from './extra-services-routing.module';

import { ExtraServicesPage } from './extra-services.page';

import { SharedModule } from '../services/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExtraServicesPageRoutingModule,
    TranslateModule,
    NgxDatatableModule,
    SharedModule
  ],
  declarations: [ExtraServicesPage]
})
export class ExtraServicesPageModule { }
