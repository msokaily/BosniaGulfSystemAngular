import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Page404PageRoutingModule } from './page404-routing.module';

import { Page404Page } from './page404.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    Page404PageRoutingModule
  ],
  declarations: [Page404Page]
})
export class Page404PageModule {}
