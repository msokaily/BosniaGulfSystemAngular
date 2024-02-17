import { firstValueFrom } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  constructor(
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    console.log('');

  }

  ionViewWillEnter() {
  }

}
