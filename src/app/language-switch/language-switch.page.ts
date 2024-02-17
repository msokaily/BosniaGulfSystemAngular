import { Component, OnInit, ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SharedService } from '../services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-switch',
  templateUrl: './language-switch.page.html',
  styleUrls: ['./language-switch.page.scss'],
})
export class LanguageSwitchPage implements OnInit {

  @ViewChild('langSelect') langSelect!: HTMLIonSelectElement;

  lang = '';

  constructor(
    private plt: Platform,
    private shared: SharedService
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.lang = this.shared.lang;
    }, 1000);
    
  }

  onLangChanged(e: any) {
    console.log('Changed: ', e);
    this.shared.initTranslate(e.detail?.value);
  }

  openLangSelect(e: any) {
    this.plt.ready().then(() => {
      this.langSelect.open(e);
    });
  }

}
