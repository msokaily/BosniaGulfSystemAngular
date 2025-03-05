import { CanPipe } from './can.pipe';
import { SharedService } from './services/shared.service';
import { Component } from '@angular/core';
import { AuthenticationService } from './services/authentication/authentication.service';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from './services/api/api.service';
import { OnesignalService } from './services/onesignal.service';
import { EVENTS, EventsService } from './services/events/events.service';

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
    private canPipe: CanPipe,
    private oneSignalService: OnesignalService,
    private events: EventsService
  ) {
    this.plt.ready().then(async () => {
      this.api.language = this.shared.initTranslate();
      this.translate.onLangChange.subscribe((newLang: any) => {
        this.api.language = this.shared.initTranslate(newLang.lang);
      });
      this.shared.pageTitle = [await shared.trans('AppName')];
      this.auth.checkAuth();
      console.log(this.auth.user);

      this.events.listen.subscribe(ev => {
        if (ev.name == EVENTS.refreshUser) {
          if (this.auth.user) {
            this.oneSignalService.init();
          }
        }
      });
      if (this.auth.user) {
        this.oneSignalService.init();
      }
    });
  }

  checkPermission(pageName: string) {
    return this.canPipe.transform(pageName, ['view']);
  }

  get user() {
    return this.auth.user;
  }

  async logout() {
    const push_token = this.oneSignalService.token;
    this.api.logout({push_token}).subscribe();
    this.shared.logout();
  }
}
