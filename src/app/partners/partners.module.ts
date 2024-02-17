import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PartnersPageRoutingModule } from './partners-routing.module';

import { PartnersPage } from './partners.page';
import { SharedModule } from '../services/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PartnersPageRoutingModule,
    TranslateModule,
    NgxDatatableModule,
    SharedModule
  ],
  declarations: [PartnersPage]
})
export class PartnersPageModule {}
