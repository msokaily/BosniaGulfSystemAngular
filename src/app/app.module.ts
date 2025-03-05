import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Observable, from } from 'rxjs';
import { GoogleMapsModule } from '@angular/google-maps';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { LanguageSwitchPageModule } from './language-switch/language-switch.module';
import { SharedModule } from './services/shared.module';

import { IonRangeCalendarModule } from "@googlproxer/ion-range-calendar";

import { OneSignal } from 'onesignal-ngx';

import { FlatpickrModule } from 'angularx-flatpickr';
import { FormsModule } from '@angular/forms';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18ns/', '.json');
}
export class CustomTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return from(import(`../assets/i18n/${lang}.json`));
  }
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot({
      mode: 'md',
      backButtonIcon: 'chevron-back-outline'
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: CustomTranslateLoader
      }
    }),
    FormsModule,
    FlatpickrModule.forRoot(),
    AppRoutingModule,
    GoogleMapsModule,
    HttpClientModule,
    NgxDatatableModule,
    LanguageSwitchPageModule,
    IonRangeCalendarModule,
    SharedModule
  ],
  providers: [
    {provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    OneSignal
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
