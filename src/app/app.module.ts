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
    AppRoutingModule,
    GoogleMapsModule,
    HttpClientModule,
    NgxDatatableModule,
    LanguageSwitchPageModule,
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule { }
