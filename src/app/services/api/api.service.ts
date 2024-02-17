import { firstValueFrom } from 'rxjs';
/* eslint-disable max-len */
/* eslint-disable quote-props */
/* eslint-disable guard-for-in */
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  siteUrl: string = environment.serverUrl;
  apiUrl: string = this.siteUrl + 'api/';
  language = 'en';

  private timeout = 12000;
  private cache: any = {};

  constructor(
    private http: HttpClient,
    private authService: AuthenticationService,
  ) {
  }

  login(params: any): Observable<any> {
    params.language = this.language;
    return this.http.post(this.apiUrl + 'login', params).pipe(timeout(this.timeout));
  }

  logout(params: any = {}): Observable<any> {
    params.language = this.language;
    return this.http.post(this.apiUrl + 'logout', params, {
      headers: { 'Authorization': 'Bearer ' + this.authService.getToken() }
    }).pipe(timeout(this.timeout));
  }

  profile(): Observable<any> {
    const params: any = {};
    params.api_token = this.authService.getToken();
    params.language = this.language;
    return this.http.get(this.apiUrl + 'profile', {
      params,
      headers: { 'Authorization': 'Bearer ' + this.authService.getToken() }
    }).pipe(timeout(this.timeout));
  }

  async constants(params: any = {}, noCache = false): Promise<any> {
    params.language = this.language;
    if (!noCache && this.cache?.constants) {
      return this.cache?.constants;
    }
    try {
      const resp: any = await firstValueFrom(this.http.get(this.apiUrl + 'constants', {
        params, headers: {
          'Authorization': 'Bearer ' + this.authService.getToken()
        }
      }).pipe(timeout(this.timeout)));
      if (resp?.status) {
        this.cache.constants = resp?.data;
        return resp?.data;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
  
  //==============
  // Users
  //==============
  async users(params: any = {}): Promise<any> {
    params.language = this.language;
    params = this.fixArrayParams(params);
    try {
      const resp: any = await firstValueFrom(this.http.get(this.apiUrl + 'users', {
        params, headers: {
          'Authorization': 'Bearer ' + this.authService.getToken()
        }
      }).pipe(timeout(this.timeout)));
      if (resp?.status) {
        return resp?.data;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
  async usersCreate(params: any = {}): Promise<any> {
    params.language = this.language;
    params = this.fixArrayParams(params);
    params = this.getFormData(params)
    try {
      const resp: any = await firstValueFrom(this.http.post(this.apiUrl + 'users', params, {
        headers: {
          'Authorization': 'Bearer ' + this.authService.getToken()
        }
      }).pipe(timeout(this.timeout)));
      return resp;
    } catch (error: any) {
      return error?.error;
    }
  }
  async usersUpdate(id: number, params: any = {}): Promise<any> {
    params.language = this.language;
    params._method = 'PUT';
    params = this.fixArrayParams(params);
    params = this.getFormData(params)
    try {
      const resp: any = await firstValueFrom(this.http.post(this.apiUrl + 'users/' + id, params, {
        headers: {
          'Authorization': 'Bearer ' + this.authService.getToken()
        }
      }).pipe(timeout(this.timeout)));
      return resp;
    } catch (error: any) {
      return error?.error;
    }
  }
  async usersDelete(id: number, params: any = {}): Promise<any> {
    params.language = this.language;
    const resp: any = await firstValueFrom(this.http.delete(this.apiUrl + 'users/' + id, {
      params, headers: {
        'Authorization': 'Bearer ' + this.authService.getToken()
      }
    }).pipe(timeout(this.timeout)));
    return resp?.status;
  }
  // ------------------------------

  //==============
  // Cars
  //==============
  async cars(params: any = {}): Promise<any> {
    params.language = this.language;
    params = this.fixArrayParams(params);
    try {
      const resp: any = await firstValueFrom(this.http.get(this.apiUrl + 'cars', {
        params, headers: {
          'Authorization': 'Bearer ' + this.authService.getToken()
        }
      }).pipe(timeout(this.timeout)));
      if (resp?.status) {
        return resp?.data;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
  async carsCreate(params: any = {}): Promise<any> {
    params.language = this.language;
    params = this.fixArrayParams(params);
    params = this.getFormData(params)
    try {
      const resp: any = await firstValueFrom(this.http.post(this.apiUrl + 'cars', params, {
        headers: {
          'Authorization': 'Bearer ' + this.authService.getToken()
        }
      }).pipe(timeout(this.timeout)));
      return resp;
    } catch (error: any) {
      return error?.error;
    }
  }
  async carsUpdate(id: number, params: any = {}): Promise<any> {
    params.language = this.language;
    params._method = 'PUT';
    params = this.fixArrayParams(params);
    params = this.getFormData(params)
    try {
      const resp: any = await firstValueFrom(this.http.post(this.apiUrl + 'cars/' + id, params, {
        headers: {
          'Authorization': 'Bearer ' + this.authService.getToken()
        }
      }).pipe(timeout(this.timeout)));
      return resp;
    } catch (error: any) {
      return error?.error;
    }
  }
  async carsDelete(id: number, params: any = {}): Promise<any> {
    params.language = this.language;
    const resp: any = await firstValueFrom(this.http.delete(this.apiUrl + 'cars/' + id, {
      params, headers: {
        'Authorization': 'Bearer ' + this.authService.getToken()
      }
    }).pipe(timeout(this.timeout)));
    return resp?.status;
  }
  async carCompanies(params: any = {}, noCache = false): Promise<any> {
    params.language = this.language;
    if (!noCache && this.cache?.carCompanies) {
      return this.cache?.carCompanies;
    }
    try {
      const resp: any = await firstValueFrom(this.http.get(this.apiUrl + 'car-companies', {
        params, headers: {
          'Authorization': 'Bearer ' + this.authService.getToken()
        }
      }).pipe(timeout(this.timeout)));
      if (resp?.status) {
        this.cache.carCompanies = resp?.data;
        return resp?.data;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
  // ------------------------------
  
  //==============
  // partners
  //==============
  async partners(params: any = {}): Promise<any> {
    params.language = this.language;
    params = this.fixArrayParams(params);
    try {
      const resp: any = await firstValueFrom(this.http.get(this.apiUrl + 'partners', {
        params, headers: {
          'Authorization': 'Bearer ' + this.authService.getToken()
        }
      }).pipe(timeout(this.timeout)));
      if (resp?.status) {
        return resp?.data;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
  async partnersCreate(params: any = {}): Promise<any> {
    params.language = this.language;
    params = this.fixArrayParams(params);
    params = this.getFormData(params)
    try {
      const resp: any = await firstValueFrom(this.http.post(this.apiUrl + 'partners', params, {
        headers: {
          'Authorization': 'Bearer ' + this.authService.getToken()
        }
      }).pipe(timeout(this.timeout)));
      return resp;
    } catch (error: any) {
      return error?.error;
    }
  }
  async partnersUpdate(id: number, params: any = {}): Promise<any> {
    params.language = this.language;
    params._method = 'PUT';
    params = this.fixArrayParams(params);
    params = this.getFormData(params)
    try {
      const resp: any = await firstValueFrom(this.http.post(this.apiUrl + 'partners/' + id, params, {
        headers: {
          'Authorization': 'Bearer ' + this.authService.getToken()
        }
      }).pipe(timeout(this.timeout)));
      return resp;
    } catch (error: any) {
      return error?.error;
    }
  }
  async partnersDelete(id: number, params: any = {}): Promise<any> {
    params.language = this.language;
    const resp: any = await firstValueFrom(this.http.delete(this.apiUrl + 'partners/' + id, {
      params, headers: {
        'Authorization': 'Bearer ' + this.authService.getToken()
      }
    }).pipe(timeout(this.timeout)));
    return resp?.status;
  }
  // ------------------------------

  uploadLicense(file: File, paramName = 'file'): Observable<any> {
    const formData = new FormData();
    formData.append(paramName, file, file.name);
    return this.http.post(this.apiUrl + 'courier-company/common/upload-file', formData);
  }

  private fixArrayParams(params: any) {
    let ret: any = {};
    Object.keys(params).forEach(elm => {
      if (Array.isArray(params[elm])) {
        ret[elm] = JSON.stringify(params[elm]);
      } else {
        ret[elm] = params[elm];
      }
    });
    return ret;
  }

  private getFormData(params: any): FormData {
    const formData = new FormData();
    for (const key in params) {
      formData.append(key, params[key]);
    }
    return formData;
  }
}
