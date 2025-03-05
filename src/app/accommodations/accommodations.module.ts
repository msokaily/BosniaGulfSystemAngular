import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AccommodationsPageRoutingModule } from './accommodations-routing.module';

import { AccommodationsPage } from './accommodations.page';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedModule } from '../services/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AccommodationsPageRoutingModule,
    TranslateModule,
    NgxDatatableModule,
    SharedModule
  ],
  declarations: [AccommodationsPage]
})
export class AccommodationsPageModule {}
