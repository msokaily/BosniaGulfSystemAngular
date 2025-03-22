import { firstValueFrom } from 'rxjs';
/* eslint-disable max-len */
/* eslint-disable quote-props */
/* eslint-disable guard-for-in */
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { retry, timeout } from 'rxjs/operators';
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
    return this.http.post(this.apiUrl + 'login', params).pipe(timeout(this.timeout), retry(2));
  }

  logout(params: any = {}): Observable<any> {
    params.language = this.language;
    return this.http.get(this.apiUrl + 'logout', {
      params,
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
  // stats
  //==============
  async stats(params: any = {}): Promise<any> {
    params.language = this.language;
    params = this.fixArrayParams(params);
    try {
      const resp: any = await firstValueFrom(this.http.get(this.apiUrl + 'stats', {
        params, headers: {
          'Authorization': 'Bearer ' + this.authService.getToken()
        }
      }).pipe(timeout(this.timeout), retry(2)));
      if (resp?.status) {
        return resp?.data;
      }
      return false;
    } catch (error) {
      return false;
    }
  }


  //==============
  // orders
  //==============
  async orders(params: any = {}, cache = false): Promise<any> {
    if (this.cache?.orders && cache) {
      return await this.cache.orders;
    }
    params.language = this.language;
    params = this.fixArrayParams(params);
    try {
      const resp: any = await firstValueFrom(this.http.get(this.apiUrl + 'orders', {
        params, headers: {
          'Authorization': 'Bearer ' + this.authService.getToken()
        }
      }).pipe(timeout(this.timeout), retry(2)));
      if (resp?.status) {
        this.cache.orders = resp?.data;
        return resp?.data;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
  async ordersView(id: number, params: any = {}): Promise<any> {
    params.language = this.language;
    params = this.fixArrayParams(params);
    try {
      const resp: any = await firstValueFrom(this.http.get(this.apiUrl + 'orders/' + id, {
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
  async ordersCreate(params: any = {}): Promise<any> {
    params.language = this.language;
    params = this.fixArrayParams(params);
    params = this.getFormData(params)
    try {
      const resp: any = await firstValueFrom(this.http.post(this.apiUrl + 'orders', params, {
        headers: {
          'Authorization': 'Bearer ' + this.authService.getToken()
        }
      }).pipe(timeout(this.timeout)));
      return resp;
    } catch (error: any) {
      return error?.error;
    }
  }
  async ordersUpdate(id: number, params: any = {}): Promise<any> {
    params.language = this.language;
    params._method = 'PUT';
    params = this.fixArrayParams(params);
    params = this.getFormData(params)
    try {
      const resp: any = await firstValueFrom(this.http.post(this.apiUrl + 'orders/' + id, params, {
        headers: {
          'Authorization': 'Bearer ' + this.authService.getToken()
        }
      }).pipe(timeout(this.timeout)));
      return resp;
    } catch (error: any) {
      return error?.error;
    }
  }
  async ordersDelete(id: number, params: any = {}): Promise<any> {
    params.language = this.language;
    const resp: any = await firstValueFrom(this.http.delete(this.apiUrl + 'orders/' + id, {
      params, headers: {
        'Authorization': 'Bearer ' + this.authService.getToken()
      }
    }).pipe(timeout(this.timeout)));
    return resp?.status;
  }
  async ordersRestore(id: number, params: any = {}): Promise<any> {
    params.language = this.language;
    const resp: any = await firstValueFrom(this.http.get(this.apiUrl + 'orders/' + id + '/restore', {
      params, headers: {
        'Authorization': 'Bearer ' + this.authService.getToken()
      }
    }).pipe(timeout(this.timeout)));
    return resp?.status;
  }
  // ------------------------------

  //==============
  // order products
  //==============
  async orderProducts(id: number, params: any = {}): Promise<any> {
    params.language = this.language;
    params = this.fixArrayParams(params);
    try {
      const resp: any = await firstValueFrom(this.http.get(this.apiUrl + `orders/${id}/products`, {
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
  async orderProductsView(id: number, params: any = {}): Promise<any> {
    params.language = this.language;
    params = this.fixArrayParams(params);
    try {
      const resp: any = await firstValueFrom(this.http.get(this.apiUrl + 'orderProducts/' + id, {
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
  async orderProductsCreate(params: any = {}): Promise<any> {
    params.language = this.language;
    params = this.fixArrayParams(params);
    params = this.getFormData(params)
    try {
      const resp: any = await firstValueFrom(this.http.post(this.apiUrl + 'orderProducts', params, {
        headers: {
          'Authorization': 'Bearer ' + this.authService.getToken()
        }
      }).pipe(timeout(this.timeout)));
      return resp;
    } catch (error: any) {
      return error?.error;
    }
  }
  async orderProductsUpdate(id: number, params: any = {}): Promise<any> {
    params.language = this.language;
    params._method = 'PUT';
    params = this.fixArrayParams(params);
    params = this.getFormData(params)
    try {
      const resp: any = await firstValueFrom(this.http.post(this.apiUrl + 'orderProducts/' + id, params, {
        headers: {
          'Authorization': 'Bearer ' + this.authService.getToken()
        }
      }).pipe(timeout(this.timeout)));
      return resp;
    } catch (error: any) {
      return error?.error;
    }
  }
  async orderProductsDelete(id: number, params: any = {}): Promise<any> {
    params.language = this.language;
    const resp: any = await firstValueFrom(this.http.delete(this.apiUrl + 'orderProducts/' + id, {
      params, headers: {
        'Authorization': 'Bearer ' + this.authService.getToken()
      }
    }).pipe(timeout(this.timeout)));
    return resp?.status;
  }
  // ------------------------------

    //==============
  // order payments
  //==============
  async orderPayments(id: number, params: any = {}): Promise<any> {
    params.language = this.language;
    params = this.fixArrayParams(params);
    try {
      const resp: any = await firstValueFrom(this.http.get(this.apiUrl + `orders/${id}/payments`, {
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
  async orderPaymentsView(id: number, params: any = {}): Promise<any> {
    params.language = this.language;
    params = this.fixArrayParams(params);
    try {
      const resp: any = await firstValueFrom(this.http.get(this.apiUrl + 'payments/' + id, {
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
  async orderPaymentsCreate(params: any = {}): Promise<any> {
    params.language = this.language;
    params = this.fixArrayParams(params);
    params = this.getFormData(params)
    try {
      const resp: any = await firstValueFrom(this.http.post(this.apiUrl + 'payments', params, {
        headers: {
          'Authorization': 'Bearer ' + this.authService.getToken()
        }
      }).pipe(timeout(this.timeout)));
      return resp;
    } catch (error: any) {
      return error?.error;
    }
  }
  async orderPaymentsUpdate(id: number, params: any = {}): Promise<any> {
    params.language = this.language;
    params._method = 'PUT';
    params = this.fixArrayParams(params);
    params = this.getFormData(params)
    try {
      const resp: any = await firstValueFrom(this.http.post(this.apiUrl + 'payments/' + id, params, {
        headers: {
          'Authorization': 'Bearer ' + this.authService.getToken()
        }
      }).pipe(timeout(this.timeout)));
      return resp;
    } catch (error: any) {
      return error?.error;
    }
  }
  async orderPaymentsDelete(id: number, params: any = {}): Promise<any> {
    params.language = this.language;
    const resp: any = await firstValueFrom(this.http.delete(this.apiUrl + 'payments/' + id, {
      params, headers: {
        'Authorization': 'Bearer ' + this.authService.getToken()
      }
    }).pipe(timeout(this.timeout)));
    return resp?.status;
  }
  // ------------------------------

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
  async cars(params: any = {}, cache = false): Promise<any> {
    if (this.cache?.cars && cache && Object.keys(params).length == 0) {
      return await this.cache.cars;
    }
    params.language = this.language;
    params = this.fixArrayParams(params);
    try {
      const resp: any = await firstValueFrom(this.http.get(this.apiUrl + 'cars', {
        params, headers: {
          'Authorization': 'Bearer ' + this.authService.getToken()
        }
      }).pipe(timeout(this.timeout)));
      if (resp?.status) {
        this.cache.cars = resp?.data;
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
  // repairs
  //==============
  async repairs(params: any = {}): Promise<any> {
    params.language = this.language;
    params = this.fixArrayParams(params);
    try {
      const resp: any = await firstValueFrom(this.http.get(this.apiUrl + 'repairs', {
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
  async repairsCreate(params: any = {}): Promise<any> {
    params.language = this.language;
    params = this.fixArrayParams(params);
    params = this.getFormData(params)
    try {
      const resp: any = await firstValueFrom(this.http.post(this.apiUrl + 'repairs', params, {
        headers: {
          'Authorization': 'Bearer ' + this.authService.getToken()
        }
      }).pipe(timeout(this.timeout)));
      return resp;
    } catch (error: any) {
      return error?.error;
    }
  }
  async repairsUpdate(id: number, params: any = {}): Promise<any> {
    params.language = this.language;
    params._method = 'PUT';
    params = this.fixArrayParams(params);
    params = this.getFormData(params)
    try {
      const resp: any = await firstValueFrom(this.http.post(this.apiUrl + 'repairs/' + id, params, {
        headers: {
          'Authorization': 'Bearer ' + this.authService.getToken()
        }
      }).pipe(timeout(this.timeout)));
      return resp;
    } catch (error: any) {
      return error?.error;
    }
  }
  async repairsDelete(id: number, params: any = {}): Promise<any> {
    params.language = this.language;
    const resp: any = await firstValueFrom(this.http.delete(this.apiUrl + 'repairs/' + id, {
      params, headers: {
        'Authorization': 'Bearer ' + this.authService.getToken()
      }
    }).pipe(timeout(this.timeout)));
    return resp?.status;
  }
  // ------------------------------
  
  //==============
  // extraServices
  //==============
  async extraServices(params: any = {}): Promise<any> {
    params.language = this.language;
    params = this.fixArrayParams(params);
    try {
      const resp: any = await firstValueFrom(this.http.get(this.apiUrl + 'extra-services', {
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
  async extraServicesCreate(params: any = {}): Promise<any> {
    params.language = this.language;
    params = this.fixArrayParams(params);
    params = this.getFormData(params)
    try {
      const resp: any = await firstValueFrom(this.http.post(this.apiUrl + 'extra-services', params, {
        headers: {
          'Authorization': 'Bearer ' + this.authService.getToken()
        }
      }).pipe(timeout(this.timeout)));
      return resp;
    } catch (error: any) {
      return error?.error;
    }
  }
  async extraServicesUpdate(id: number, params: any = {}): Promise<any> {
    params.language = this.language;
    params._method = 'PUT';
    params = this.fixArrayParams(params);
    params = this.getFormData(params)
    try {
      const resp: any = await firstValueFrom(this.http.post(this.apiUrl + 'extra-services/' + id, params, {
        headers: {
          'Authorization': 'Bearer ' + this.authService.getToken()
        }
      }).pipe(timeout(this.timeout)));
      return resp;
    } catch (error: any) {
      return error?.error;
    }
  }
  async extraServicesDelete(id: number, params: any = {}): Promise<any> {
    params.language = this.language;
    const resp: any = await firstValueFrom(this.http.delete(this.apiUrl + 'extra-services/' + id, {
      params, headers: {
        'Authorization': 'Bearer ' + this.authService.getToken()
      }
    }).pipe(timeout(this.timeout)));
    return resp?.status;
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

  //==============
  // Car Companies
  //==============
  async carCompaniesList(params: any = {}): Promise<any> {
    params.language = this.language;
    params = this.fixArrayParams(params);
    try {
      const resp: any = await firstValueFrom(this.http.get(this.apiUrl + 'car-companies', {
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
  async carCompaniesCreate(params: any = {}): Promise<any> {
    params.language = this.language;
    params = this.fixArrayParams(params);
    params = this.getFormData(params)
    try {
      const resp: any = await firstValueFrom(this.http.post(this.apiUrl + 'car-companies', params, {
        headers: {
          'Authorization': 'Bearer ' + this.authService.getToken()
        }
      }).pipe(timeout(this.timeout)));
      return resp;
    } catch (error: any) {
      return error?.error;
    }
  }
  async carCompaniesUpdate(id: number, params: any = {}): Promise<any> {
    params.language = this.language;
    params._method = 'PUT';
    params = this.fixArrayParams(params);
    params = this.getFormData(params)
    try {
      const resp: any = await firstValueFrom(this.http.post(this.apiUrl + 'car-companies/' + id, params, {
        headers: {
          'Authorization': 'Bearer ' + this.authService.getToken()
        }
      }).pipe(timeout(this.timeout)));
      return resp;
    } catch (error: any) {
      return error?.error;
    }
  }
  async carCompaniesDelete(id: number, params: any = {}): Promise<any> {
    params.language = this.language;
    const resp: any = await firstValueFrom(this.http.delete(this.apiUrl + 'car-companies/' + id, {
      params, headers: {
        'Authorization': 'Bearer ' + this.authService.getToken()
      }
    }).pipe(timeout(this.timeout)));
    return resp?.status;
  }
  // ------------------------------

  //==============
  // Drivers
  //==============
  async drivers(params: any = {}, cache = false): Promise<any> {
    if (this.cache?.drivers && cache && Object.keys(params).length == 0) {
      return await this.cache.drivers;
    }
    params.language = this.language;
    params = this.fixArrayParams(params);
    try {
      const resp: any = await firstValueFrom(this.http.get(this.apiUrl + 'drivers', {
        params, headers: {
          'Authorization': 'Bearer ' + this.authService.getToken()
        }
      }).pipe(timeout(this.timeout)));
      if (resp?.status) {
        this.cache.drivers = resp?.data;
        return resp?.data;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
  async driversCreate(params: any = {}): Promise<any> {
    params.language = this.language;
    params = this.fixArrayParams(params);
    params = this.getFormData(params)
    try {
      const resp: any = await firstValueFrom(this.http.post(this.apiUrl + 'drivers', params, {
        headers: {
          'Authorization': 'Bearer ' + this.authService.getToken()
        }
      }).pipe(timeout(this.timeout)));
      return resp;
    } catch (error: any) {
      return error?.error;
    }
  }
  async driversUpdate(id: number, params: any = {}): Promise<any> {
    params.language = this.language;
    params._method = 'PUT';
    params = this.fixArrayParams(params);
    params = this.getFormData(params)
    try {
      const resp: any = await firstValueFrom(this.http.post(this.apiUrl + 'drivers/' + id, params, {
        headers: {
          'Authorization': 'Bearer ' + this.authService.getToken()
        }
      }).pipe(timeout(this.timeout)));
      return resp;
    } catch (error: any) {
      return error?.error;
    }
  }
  async driversDelete(id: number, params: any = {}): Promise<any> {
    params.language = this.language;
    const resp: any = await firstValueFrom(this.http.delete(this.apiUrl + 'drivers/' + id, {
      params, headers: {
        'Authorization': 'Bearer ' + this.authService.getToken()
      }
    }).pipe(timeout(this.timeout)));
    return resp?.status;
  }
  // ------------------------------

  //==============
  // Accommodations
  //==============
  async accommodations(params: any = {}, cache = false): Promise<any> {
    if (this.cache?.accommodations && cache && Object.keys(params).length == 0) {
      return await this.cache.accommodations;
    }
    params.language = this.language;
    params = this.fixArrayParams(params);
    try {
      const resp: any = await firstValueFrom(this.http.get(this.apiUrl + 'accommodations', {
        params, headers: {
          'Authorization': 'Bearer ' + this.authService.getToken()
        }
      }).pipe(timeout(this.timeout)));
      if (resp?.status) {
        this.cache.accommodations = resp?.data;
        return resp?.data;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
  async accommodationsCreate(params: any = {}): Promise<any> {
    params.language = this.language;
    params = this.fixArrayParams(params);
    params = this.getFormData(params)
    try {
      const resp: any = await firstValueFrom(this.http.post(this.apiUrl + 'accommodations', params, {
        headers: {
          'Authorization': 'Bearer ' + this.authService.getToken()
        }
      }).pipe(timeout(this.timeout)));
      return resp;
    } catch (error: any) {
      return error?.error;
    }
  }
  async accommodationsUpdate(id: number, params: any = {}): Promise<any> {
    params.language = this.language;
    params._method = 'PUT';
    params = this.fixArrayParams(params);
    params = this.getFormData(params)
    try {
      const resp: any = await firstValueFrom(this.http.post(this.apiUrl + 'accommodations/' + id, params, {
        headers: {
          'Authorization': 'Bearer ' + this.authService.getToken()
        }
      }).pipe(timeout(this.timeout)));
      return resp;
    } catch (error: any) {
      return error?.error;
    }
  }
  async accommodationsDelete(id: number, params: any = {}): Promise<any> {
    params.language = this.language;
    const resp: any = await firstValueFrom(this.http.delete(this.apiUrl + 'accommodations/' + id, {
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

  export_orders_excel(params: any = {}) {
    return `${this.apiUrl}orders/export_excel?api_token=${this.authService.getToken()}&locale=${this.language}${(params ? '&' : '')+Object.keys(params).map((key: any) => `${key}=${params[key]}`).join('&')}`;
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
