import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  key = 'aW#3f(S3fXz7eMo!25gKb1';

  constructor() { }

  public set(key: string, value: any) {
    localStorage.setItem(key, this.encrypt(value));
  }

  public get(key: string) {
    const data = localStorage.getItem(key) || '';
    return this.decrypt(data);
  }
  public remove(key: string) {
    localStorage.removeItem(key);
  }

  public clear() {
    localStorage.clear();
  }

  private encrypt(txt: string): string {
    return CryptoJS.AES.encrypt(txt, this.key).toString();
  }

  private decrypt(txtToDecrypt: string) {
    return CryptoJS.AES.decrypt(txtToDecrypt, this.key).toString(CryptoJS.enc.Utf8);
  }
}
