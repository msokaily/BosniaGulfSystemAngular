import { Subscription } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { Platform, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-popup-info',
  templateUrl: './popup-info.page.html',
  styleUrls: ['./popup-info.page.scss'],
})
export class PopupInfoPage implements OnInit {

  data: any;
  backButtonSubscription!: Subscription;
  
  constructor(
    private popCtrl: PopoverController,
    private platform: Platform
  ) { }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {
  }

  ionViewDidEnter() {
    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(0, () => {
      this.close();
    });
  }

  ionViewWillLeave(){ 
    this.backButtonSubscription.unsubscribe();
  }

  async close() {
    const pop = await this.popCtrl.getTop();
    if (pop) {
      pop?.dismiss();
    }
  }

}
