import { firstValueFrom } from 'rxjs';
/* eslint-disable no-underscore-dangle */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/prefer-for-of */
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EVENTS, EventsService } from '../events/events.service';
import { LocalStorageService } from '../localStorage/local-storage.service';
import { SharedService } from '../shared.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  public cart = [];
  public tempSellerId: any;
  private cartStorageKey = '_CART_';
  private seller: any;

  constructor(
    private events: EventsService,
    private storage: LocalStorageService,
    private shared: SharedService,
    private tranlsate: TranslateService
  ) {
    this.cart = JSON.parse(this.storage.get(this.cartKey) || '[]');
    this.events.publish({ name: EVENTS.refreshCart, data: this.cart });
    this.events.listen.subscribe(v => {
      if (v.name === EVENTS.refreshSeller) {
        this.seller = v.data;
        this.cart = JSON.parse(this.storage.get(this.cartKey) || '[]');
      }
    });
  }

  private get cartKey() {
    if (this.tempSellerId) {
      return `${this.tempSellerId}_${this.cartStorageKey}`;
    }
    return this.seller ? `${this.seller?.sellerId}_${this.cartStorageKey}` : this.cartStorageKey;
  }

  exist(currentItem) {
    for (let i = 0; i < this.cart.length; i++) {
      if (this.cart[i].cartParams.sellerId == currentItem.cartParams.sellerId &&
        this.cart[i].cartParams.productId == currentItem.cartParams.productId &&
        this.cart[i].cartParams.variantId == currentItem.cartParams.variantId) {
        return this.cart[i];
      }
    }
    return false;
  }

  async add(item, quantity = 1) {
    const currentItem = this.exist(item);
    if (currentItem) {
      if (item?.piece < currentItem.cartParams.quantity + quantity) {
        this.showPiecesLimit();
        return false;
      }
      currentItem.cartParams.quantity += quantity;
    } else {
      if (item?.piece < item?.cartParams?.quantity) {
        this.showPiecesLimit();
        return false;
      }
      item.cartParams.quantity = quantity;
      item.cart_id = Math.round(Math.random() * (1000000));
      this.cart.push(item);
    }
    this.save();
    return true;
  }

  remove(id) {
    const ind = this.cart.findIndex(v => v.cart_id == id);
    this.cart.splice(ind, 1);
    this.save();
  }

  async clear() {
    this.cart = [];
    return await this.save();
  }

  async save(withoutPulish = false) {
    return new Promise((resolve) => {
      this.storage.set(this.cartKey, JSON.stringify(this.cart));
      if (!withoutPulish) {
        this.events.publish({ name: EVENTS.refreshCart, data: this.cart });
      }
      setTimeout(() => {
        resolve(true);
      }, 150);
    });
  }

  getForOrder() {
    return this.cart.map(v => ({
      sellerId: v?.cartParams?.sellerId,
      productId: v?.cartParams?.productId,
      variantId: v?.cartParams?.variantId,
      quantity: v?.cartParams?.quantity.toString(),
      instruction: v?.cartParams?.instruction
    }));
  }

  printCart() {
    console.log('Cart: ', this.cart);
  }

  count() {
    return this.cart.length;
    const qnt = this.cart.map(v => v.cartParams.quantity);
    let sum = 0;
    qnt.forEach(elm => { sum += elm; });
    return sum;
  }

  total() {
    let sum = 0;
    this.cart.forEach(elm => { sum += elm.cartParams.quantity * elm.cartPrice; });
    return sum;
  }

  async showPiecesLimit() {
    const trans = await firstValueFrom(this.tranlsate.get(['cart.limit-pieces', 'common.dismiss']));
    this.shared.toast({
      message: trans['cart.limit-pieces'],
      duration: 2500,
      color: 'warning',
      buttons: [trans['common.dismiss']]
    });
  }

}
