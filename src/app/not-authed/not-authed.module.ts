import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NotAuthedPageRoutingModule } from './not-authed-routing.module';

import { NotAuthedPage } from './not-authed.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NotAuthedPageRoutingModule,
    TranslateModule
  ],
  declarations: [NotAuthedPage]
})
export class NotAuthedPageModule {}
