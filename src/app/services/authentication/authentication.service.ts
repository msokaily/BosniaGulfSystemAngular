import { Platform, NavController, MenuController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LocalStorageService } from '../localStorage/local-storage.service';
import jwt_decode from 'jwt-decode';
import { Router } from '@angular/router';

const TOKEN_KEY = 'AUTH-TOKEN';
const USER_KEY = 'USER-INFO';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  authenticationState = new BehaviorSubject(false);

  public token: any = null;
  public user: any = null;

  public autoLoginUser = null;

  constructor(
    private storage: LocalStorageService,
    private plt: Platform,
    private navCtrl: NavController,
    private menuCtrl: MenuController,
    private router: Router
  ) {
    this.plt.ready().then(() => {
      this.checkToken();
    });
  }

  checkToken() {
    const user = this.storage.get(USER_KEY);
    if (user) {
      this.user = JSON.parse(user);
      this.token = this.user?.accessToken;
      this.authenticationState.next(true);
      return true;
    } else {
      this.authenticationState.next(false);
      return false;
    }
  }

  login(token: string) {
    this.token = token;
    this.storage.set(TOKEN_KEY, token);
    this.authenticationState.next(true);
  }

  logout() {
    this.storage.remove(TOKEN_KEY);
    this.storage.remove(USER_KEY);
    this.user = null;
    this.token = null;
    this.authenticationState.next(false);
  }

  getToken(): string {
    return this.token;
  }

  getUser() {
    const data = this.storage.get(USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  setUser(data: any) {
    this.storage.set(USER_KEY, JSON.stringify(data));
    this.user = data;
    return true;
  }

  updateUser(data: any = {}) {
    const res: any = this.getUser();
    const temp = { ...res, ...data };
    this.storage.set(USER_KEY, JSON.stringify(temp));
    this.user = temp;
    return temp;
  }

  deleteUserParam(param: any) {
    const res: any = this.getUser();
    delete res[param];
    this.storage.set(USER_KEY, JSON.stringify(res));
    this.user = res;
    return res;
  }

  isAuthenticated() {
    return this.token ? true : false;
  }

  checkAuth() {
    if (this.getUser()) {
      this.menuCtrl.enable(true);
      // this.navCtrl.navigateRoot('/home');
    } else {
      this.menuCtrl.enable(false);
      this.navCtrl.navigateRoot('/login');
    }
  }

  checkTokenValid(token?: any) {
    const decoded: any = jwt_decode(token || this.getToken());
    if (decoded?.exp <= Math.round(new Date().getTime() / 1000)) {
      return false;
    }
    return true;
  }

}
