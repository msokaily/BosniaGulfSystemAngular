import { firstValueFrom } from 'rxjs';
import { AuthenticationService } from './../services/authentication/authentication.service';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectionStrategy, ChangeDetectorRef, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
/* eslint-disable @angular-eslint/no-host-metadata-property */
import { Component, OnInit } from '@angular/core';
import { IonCheckbox, NavController } from '@ionic/angular';
import * as moment from 'moment';
import { ClientService, ORDER } from '../providers/client/client.service';
import { SharedService } from '../services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-choose-time',
  templateUrl: './choose-time.page.html',
  styleUrls: ['./choose-time.page.scss'],
  host: {class: 'ministore-page'}
})
export class ChooseTimePage implements OnInit {

  @ViewChild('asapCheckbox') asapCheckbox: IonCheckbox;
  @ViewChild('scheduleCheckbox') scheduleCheckbox: IonCheckbox;

  days = [];
  dayIndex = 0;

  form = {
    fromTime: '',
    toTime: '',
    day: '',
    deliveryType: 'scheduleDelivery'
  };

  order: ORDER;

  user: any;

  selectedToTime = null;

  openTimes = [
    {
      hour: 6,
      minute: 0
    },
    {
      hour: 22,
      minute: 0
    }
  ];

  constructor(
    private changeDetector: ChangeDetectorRef,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private auth: AuthenticationService,
    private clientService: ClientService,
    private shared: SharedService,
    private translate: TranslateService
  ) {
  }

  get lang() {
    return this.translate.currentLang;
  }

  back() {
    this.navCtrl.back();
  }

  async ngOnInit() {
    this.auth.checkToken();
    this.user = this.auth.user;
    this.order = this.clientService.getOrder();
    this.shared.pageTitle = [await firstValueFrom(this.translate.get('choose-time.title'))];
    this.refresh();
  }

  async submit() {
    this.order.deliveryInfo = this.form;
    if (this.form.deliveryType === 'immediateDelivery') {
      this.order.deliveryInfo.fromTime = moment().format('hh:mm a');
    }
    await this.clientService.setOrder(this.order);
    this.navCtrl.navigateForward(this.shared.route('order-review', [this.order.storeUrl]), {
      replaceUrl: false
    });
  }

  refresh() {
    const days = [];
    const dateMoment = moment();
    for (let i = 0; i < 6; i++) {
      if (this.order?.store?.schedule) {
        const hour = moment()
          .add(this.order?.store?.scheduleTimeDifference?.hours, 'hour')
          .add(this.order?.store?.scheduleTimeDifference?.minutes, 'minute').get('hour');
        if (i === 0 &&
            (hour >= this.openTimes[1].hour ||
              moment().get('hour') >= this.openTimes[1].hour ||
              moment().get('hour') <= this.openTimes[0].hour)) {
          dateMoment.add(1, 'day');
          continue;
        }
      }
      const tempDate = moment(dateMoment);
      days.push({
        day: dateMoment.get('date'),
        date: dateMoment.format('MMM DD, YYYY'),
        dayName: tempDate.locale(this.translate.currentLang).format('dddd'),
      });
      dateMoment.add(1, 'day');
    }
    this.days = days;
    this.selectDay(0);
  }

  selectDay(index) {
    this.dayIndex = index;
    this.form.day = this.days[index];
  }

  dayChanged(e) {
    this.form.day = this.days[e.detail.value];
  }
  timeFromChanged(e) {
    this.form.fromTime = e;
    if (!this.form.fromTime) {return;}
    if (this.order?.store?.schedule) {
      const toTime = moment(this.shared.parseDate(moment().format('YYYY-MM-DD') + ' ' + this.form.fromTime));
      toTime.add(this.order?.store?.scheduleTimeDifference?.hours, 'hour');
      toTime.add(this.order?.store?.scheduleTimeDifference?.minutes, 'minute');
      this.selectedToTime = toTime.format('hh:mm a');
    }
    this.changeDetector.detectChanges();
  }
  timeToChanged(e) {
    this.form.toTime = e;
    this.changeDetector.detectChanges();
  }

  deliveryTypeChanged(e) {
    if (e.detail.checked) {
      this.form.deliveryType = e.detail.value;
    }else {
        if (this.form.deliveryType === 'immediateDelivery') {
          this.asapCheckbox.checked = true;
        }else {
          this.scheduleCheckbox.checked = true;
        }
    }
  }
}
