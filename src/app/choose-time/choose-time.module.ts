import { TimeSelectPageModule } from './../shared/components/time-select/time-select.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChooseTimePageRoutingModule } from './choose-time-routing.module';

import { ChooseTimePage } from './choose-time.page';
import { SharedModule } from '../services/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChooseTimePageRoutingModule,
    TimeSelectPageModule,
    SharedModule
  ],
  declarations: [ChooseTimePage]
})
export class ChooseTimePageModule {}
