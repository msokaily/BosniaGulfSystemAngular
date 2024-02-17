/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface EVENT {
  name: string;
  data?: any;
}

export enum EVENTS {
  refreshSeller = 'refreshSeller',
  refreshSellerItems = 'refreshSellerItems',
  refreshUser = 'refreshUser',
  refreshCart = 'refreshCart',
  refreshUserAddress = 'refreshUserAddress',
}

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  private eventObservable = new Subject<EVENT>();
  listen = this.eventObservable.asObservable();
  publish(event: EVENT) {
    this.eventObservable.next(event);
  }

  constructor() { }
}
