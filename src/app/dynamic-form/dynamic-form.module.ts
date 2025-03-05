import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DynamicFormPageRoutingModule } from './dynamic-form-routing.module';

import { DynamicFormPage } from './dynamic-form.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    DynamicFormPageRoutingModule
  ],
  declarations: [DynamicFormPage],
  exports: [DynamicFormPage]
})
export class DynamicFormPageModule {}
