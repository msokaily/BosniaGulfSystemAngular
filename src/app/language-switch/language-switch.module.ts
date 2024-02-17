import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LanguageSwitchPageRoutingModule } from './language-switch-routing.module';

import { LanguageSwitchPage } from './language-switch.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LanguageSwitchPageRoutingModule,
    TranslateModule
  ],
  declarations: [LanguageSwitchPage],
  exports: [LanguageSwitchPage]
})
export class LanguageSwitchPageModule {}
