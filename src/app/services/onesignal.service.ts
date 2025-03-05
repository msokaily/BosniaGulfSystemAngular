import { Injectable } from '@angular/core';
import { OneSignal } from 'onesignal-ngx';
import { environment } from 'src/environments/environment';
import { ApiService } from './api/api.service';
import { AuthenticationService } from './authentication/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class OnesignalService {

  token: any;

  constructor(
    private onesignal: OneSignal,
    private api: ApiService,
    private auth: AuthenticationService
  ) { }

  init() {
    this.onesignal.init({
      appId: environment.onesignal.appId,
      persistNotification: true,
      allowLocalhostAsSecureOrigin: true,
    }).then((resp) => {
      this.updatePushToken();
    });
    this.updatePushToken();
  }

  updatePushToken() {
    this.token = this.onesignal.User.PushSubscription.id;
    if (this.token) {
      this.api.usersUpdate(this.auth?.user?.id, {
        push_token: this.onesignal.User.PushSubscription.id
      });
    }
  }
}
