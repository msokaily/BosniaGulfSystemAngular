import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditPagePageRoutingModule } from './edit-page-routing.module';

import { EditPagePage } from './edit-page.page';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../services/shared.module';

import { IonRangeCalendarModule } from "@googlproxer/ion-range-calendar";
import { FlatpickrModule } from 'angularx-flatpickr';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditPagePageRoutingModule,
    TranslateModule,
    IonRangeCalendarModule,
    FlatpickrModule,
    SharedModule
  ],
  declarations: [EditPagePage]
})
export class EditPagePageModule {}
