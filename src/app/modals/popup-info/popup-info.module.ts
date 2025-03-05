import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PopupInfoPageRoutingModule } from './popup-info-routing.module';

import { PopupInfoPage } from './popup-info.page';
import { SharedModule } from 'src/app/services/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PopupInfoPageRoutingModule,
    SharedModule
  ],
  declarations: [PopupInfoPage]
})
export class PopupInfoPageModule {}
