import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditPagePageRoutingModule } from './edit-page-routing.module';

import { EditPagePage } from './edit-page.page';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../services/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditPagePageRoutingModule,
    TranslateModule,
    SharedModule
  ],
  declarations: [EditPagePage]
})
export class EditPagePageModule {}
