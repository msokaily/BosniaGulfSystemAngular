/* eslint-disable guard-for-in */
/* eslint-disable max-len */
/* eslint-disable @angular-eslint/no-host-metadata-property */
import { MenuController, NavController, Platform } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SharedService } from '../services/shared.service';
import { ApiService } from '../services/api/api.service';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { EVENTS, EventsService } from '../services/events/events.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  host: { class: 'login-page' }
})
export class LoginPage implements OnInit {

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required)
  });

  showPassword = false;

  isLoading = false;

  clicks_count = 0;

  constructor(
    private navCtrl: NavController,
    private shared: SharedService,
    private api: ApiService,
    private auth: AuthenticationService,
    public plt: Platform,
    private menuCtrl: MenuController,
    private events: EventsService
  ) { }

  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password'); }

  ngOnInit() {
    console.log();
  }

  loading(stop = false) {
    if (stop) {
      this.isLoading = false;
      this.form.enable();
    } else {
      this.isLoading = true;
      this.form.disable();
    }
  }

  async submit() {
    this.form.markAllAsTouched();
    let values: any = {};
    if (this.form.invalid) {
      this.shared.toast({
        message: await this.shared.trans('incorrect_login'),
        color: 'danger',
        duration: 2000,
        buttons: [await this.shared.trans('common.close')]
      });
      return;
    }
    this.loading();
    values = this.form.value;
    this.api.login(values).subscribe({
      next: async (response) => {
      // console.log('Login successfully', response);
      this.loading(true);
      const user = response.data;
      this.loginUser(user);
      this.form.reset();
    },
    error: async (error) => {
      console.log('Error Login: ', error);
      this.loading(true);
      let res = ``;
      if (error?.statusText == 'Unknown Error') {
        res = await this.shared.trans('server_error');
      }else {
        const errors = error.error?.data?.errors;
        const msgs: any = [];
        for (const key in errors) {
          const value = errors[key];
          value.forEach((v: any) => {
            msgs.push(`<li>${v}</li>`);
          });
        }
        if (msgs?.length > 0) {
          res = `<ul>${msgs.join()}</ul>`;
        } else {
          res = error.error?.message || error.error?.data?.message;
        }
      }
      this.shared.alert({
        header: await this.shared.trans('common.error'),
        message: res,
        buttons: [await this.shared.trans('common.ok')]
      });
    }});
  }

  loginUser(user: any) {
    this.auth.setUser(user);
    this.auth.checkToken();
    this.auth.checkAuth();
    this.navCtrl.navigateRoot('home');
    this.events.publish({name: EVENTS.refreshUser, data: user});
  }

  ionViewWillEnter() {
    if (this.auth.user) {
      this.shared.navRoot('home');
    }
  }

  goRegister() {
    this.navCtrl.navigateForward('register');
  }
  goResetpass() {
    this.navCtrl.navigateForward('resetpass');
  }

}
