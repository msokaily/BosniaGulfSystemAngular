import { SharedService } from './services/shared.service';
import { Component } from '@angular/core';
import { AuthenticationService } from './services/authentication/authentication.service';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from './services/api/api.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private auth: AuthenticationService,
    private plt: Platform,
    private translate: TranslateService,
    private api: ApiService,
    private shared: SharedService,
  ) {
    this.plt.ready().then(async () => {
      this.api.language = this.shared.initTranslate();
      this.translate.onLangChange.subscribe((newLang: any) => {
        this.api.language = this.shared.initTranslate(newLang.lang);
      });
      this.shared.pageTitle = [await shared.trans('AppName')];
      this.auth.checkAuth();
      console.log(auth.user);
    });
  }

  get user() {
    return this.auth.user;
  }

  async logout() {
    this.shared.logout();
  }
}
