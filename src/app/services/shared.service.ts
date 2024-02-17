import { firstValueFrom } from 'rxjs';
/* eslint-disable guard-for-in */
import { TranslateService } from '@ngx-translate/core';
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-var */
import { Injectable } from '@angular/core';
import { AlertController, AlertOptions, Platform, ToastController, ToastOptions } from '@ionic/angular';
import { LoadingController, LoadingOptions, NavController } from '@ionic/angular';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthenticationService } from './authentication/authentication.service';
import { EVENTS, EventsService } from './events/events.service';
import { NavigationOptions } from '@ionic/angular/common/providers/nav-controller';

@Injectable({
  providedIn: 'root'
})
export class WindowRef {
  get nativeWindow(): Window {
    return window;
  }
}

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  public currency = 'KM';

  constructor(
    private plt: Platform,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private window: WindowRef,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private titleService: Title,
    private router: Router,
    private translate: TranslateService,
    private auth: AuthenticationService,
    private events: EventsService
  ) {}

  public get lang() {
    return this.translate.currentLang || 'en';
  }

  public set pageTitle(_title: any[]) {
    this.translate.get(_title).subscribe((resp) => {
      try {
        if (resp) {
          _title = Object.values(resp);
        }
      }catch(e) {}
      // _title.unshift([environment.appName]);
      this.titleService.setTitle(_title.join(' | '));
    });
  }

  public set pageFavicon(link: string) {
    const favIcon: HTMLLinkElement = document.querySelector('#favIcon') as HTMLLinkElement;
    favIcon.href = link;
  }

  public route(name: string, params = []) {
    const tempPath = this.router.config.find(v => v.data?.['name'] === name)?.path?.split('/');
    const path = tempPath as [];
    let paramIndex = 0;
    tempPath?.forEach((elm, index) => {
      if (elm.startsWith(':')) {
        path[index] = params[paramIndex];
        paramIndex++;
      }
    });
    return path.join('/');
  }

  async trans(items: any): Promise<string | any> {
    return new Promise((resolve, reject) => {
      this.translate.get(items).subscribe(resp => {
        return resolve(resp);
      });
    });
  }

  public changeLang(newLang: string) {
    this.translate.use(newLang);
  }

  initTranslate(newLang = null) {
    let lang = localStorage.getItem('_LANG_') || this.translate.getBrowserLang() || 'en';
    if (newLang) {
      lang = newLang;
      localStorage.setItem('_LANG_', lang);
    }
    this.translate.setDefaultLang(lang);
    this.translate.use(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.classList.remove(`lang-${lang === 'ar' ? 'en' : 'ar'}`);
    document.documentElement.classList.add('lang-'+lang);
    return lang;
  }

  public async alert(alertOptions: AlertOptions = {header: 'Alert', message: ''}) {
    const alert = await this.alertCtrl.create(alertOptions);
    alert.present();
    return alert;
  }

  public async toast(toastOptions: ToastOptions = {message: '', duration: 2000}) {
    const toast = await this.toastCtrl.create(toastOptions);
    toast.present();
    return toast;
  }

  public async loading(loadingOptions: LoadingOptions = {message: 'Loading'}) {
    if (loadingOptions.message === 'Loading') {
      loadingOptions.message = await firstValueFrom(this.translate.get('common.loading'));
    }
    const loading = await this.loadingCtrl.create(loadingOptions);
    loading.present();
    return loading;
  }

  public clearNavHistory(isDouble = false) {
    this.plt.ready().then(() => {
      this.window.nativeWindow.history.pushState(null, '', null);
      if (isDouble) {
        this.window.nativeWindow.history.pushState(null, '', null);
      }
    });
  }
  public async backNavHistory(isDouble = false) {
    return new Promise<any>((resolve) => {
      this.plt.ready().then(() => {
        if (this.window.nativeWindow.history.state === null) {
          this.window.nativeWindow.history.back();
          if (isDouble) {
            setTimeout(() => {
              if (this.window.nativeWindow.history.state === null) {
                this.window.nativeWindow.history.back();
              }
            }, 100);
          }
        }
        setTimeout(() => {
          resolve(true);
        }, 120);
      });
    });
  }

  public notFoundNav() {
    this.navCtrl.navigateRoot('page404', {
      animated: false,
      animationDirection: 'back',
      skipLocationChange: true
    });
    return false;
  }

  mapAddressAttribute(type: string, arr: []) {
    try {
      return arr.filter((v: any) => v.types.includes(type)).map((v: any) => v.long_name)[0];
    }catch(e) {
      return null;
    }
  }

  parseDate(s: string) {
    const a: any = s.split(/[^0-9]/);
    const am = s.indexOf('am');
    let hrs: any = parseInt(a[3], 10);
    if (am === -1 && hrs < 12) {
      hrs = hrs + 12;
    }
    if (am !== -1 && hrs === 12) {
      hrs = hrs - 12;
    }
    a[3] = hrs;
    //for (i=0;i<a.length;i++) { alert(a[i]); }
    return new Date(a[0],a[1]-1,a[2],a[3],a[4],a[5] );
  }

  toBase64(text: string) {
    const codeUnits = new Uint16Array(text.length);
    for (let i = 0; i < codeUnits.length; i++) {
      codeUnits[i] = text.charCodeAt(i);
    }
    return btoa(String.fromCharCode(...new Uint8Array(codeUnits.buffer)));
  }

  fromBase64(encoded: string) {
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return String.fromCharCode(...new Uint16Array(bytes.buffer));
  }

  async logout() {
    const trans = await firstValueFrom(this.translate.get([
      'common.confirmation',
      'common.logout-confirm',
      'common.logout-success',
      'common.yes',
      'common.no',
    ]));
    this.alert({
      header: trans['common.confirmation'],
      message: trans['common.logout-confirm'],
      buttons: [
        {
          text: trans['common.yes'],
          handler: () => {
            this.auth.logout();
            this.auth.checkAuth();
            this.events.publish({name: EVENTS.refreshUser, data: null});
            this.toast({message: trans['common.logout-success'], color: 'success', duration: 1500});
          }
        },
        {
          text: trans['common.no']
        }
      ]
    });
  }

  public nav(uri: string, opts: NavigationOptions = {}) {
    this.navCtrl.navigateForward(uri, opts);
  }
  public navRoot(uri: string, opts: NavigationOptions = {}) {
    this.navCtrl.navigateRoot(uri, opts);
  }

  public back() {
    this.navCtrl.back();
  }

}

export interface CustomInput {
  name: string;
  title: string;
  type: 'text' | 'email' | 'password' | 'select' | 'checkbox' | 'range' | 'radio' | 'date' | 'datetime' | 'file';
  value?: any;
  options?: any[];
  multiple?: boolean;
  format?: any;
  required?: boolean;
  note?: string;
}
