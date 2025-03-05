import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RepairsPageRoutingModule } from './repairs-routing.module';

import { RepairsPage } from './repairs.page';
import { SharedModule } from '../services/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RepairsPageRoutingModule,
    TranslateModule,
    NgxDatatableModule,
    SharedModule
  ],
  declarations: [RepairsPage]
})
export class RepairsPageModule {}
