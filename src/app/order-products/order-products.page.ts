import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CustomInput, SharedService } from '../services/shared.service';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { ApiService } from '../services/api/api.service';
import { PopoverController } from '@ionic/angular';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { EditPagePage } from '../edit-page/edit-page.page';
import { DayConfig, CalendarResult } from '@googlproxer/ion-range-calendar';
import { DatePipe } from '@angular/common';
import { EVENTS, EventsService } from '../services/events/events.service';

@Component({
  selector: 'app-order-products',
  templateUrl: './order-products.page.html',
  styleUrls: ['./order-products.page.scss'],
})
export class OrderProductsPage implements OnInit {

  @Input() order: any;
  @Output() OnChange = new EventEmitter<any>();
  @Input() canEdit: boolean = true;

  items: any[] = [];

  ColumnMode = ColumnMode;

  loadingIndicator = false;

  randomToken = 1;

  constants: any;

  cars: any[] = [];
  accommodations: any[] = [];
  drivers: any[] = [];

  paymentsItems: any[] = [];

  productType!: string;

  inputs: CustomInput[] = [];

  pop!: HTMLIonPopoverElement;

  constructor(
    private auth: AuthenticationService,
    private api: ApiService,
    public shared: SharedService,
    private popoverCtrl: PopoverController,
    private datePipe: DatePipe,
    private events: EventsService
  ) { }

  get carsItems() { return this.items.filter(v => v?.type === 'car'); }
  get accommodationsItems() { return this.items.filter(v => v?.type === 'accommodation'); }
  get driversItems() { return this.items.filter(v => v?.type === 'driver'); }

  ngOnInit() {
    this.refresh();
  }

  async refresh(hideLoading = false, cache = true) {
    if (!hideLoading) {
      this.loadingIndicator = true;
    }
    this.constants = await this.api.constants();
    this.productType = this.productType ?? (this.constants?.product_types ? this.constants?.product_types[0] : 'car');
    this.cars = await this.api.cars({}, cache);
    this.accommodations = await this.api.accommodations({ status: 1 }, cache);
    this.drivers = await this.api.drivers({ status: 1 }, cache);
    const resp = await this.api.orderProducts(this.order?.id, {});
    if (resp) {
      this.items = resp;
    }
    const respPayments = await this.api.orderPayments(this.order?.id);
    if (respPayments) {
      this.paymentsItems = respPayments;
    }
    this.loadingIndicator = false;
  }

  async add(data?: any, errors?: any) {
    const loading = await this.shared.loading({ message: await this.shared.trans('common.loading') });
    loading.dismiss();
    let products = [];
    if (this.productType == 'accommodation') {
      products = this.accommodations.map(v => { return { id: v?.id, name: v?.name, image: v?.image_url?.url } });
    } else if (this.productType == 'driver') {
      products = this.drivers.map(v => { return { id: v?.id, name: v?.name, image: v?.image_url?.url } });
    } else {
      products = this.cars.map(v => { return { id: v?.id, name: v?.name, image: v?.image_url?.url } });
    }
    let min_date = new Date(new Date().getTime() - (60 * 60 * 24 * 30 * 12 * 1000));
    const inputs: CustomInput[] = [
      {
        name: 'item_id',
        type: 'select',
        title: await this.shared.trans(this.productType),
        value: parseInt(data?.item_id) || null,
        options: products,
        required: true,
        changed: (newValue: any) => {
          const value = newValue?.detail?.value;
          const product = (this.productType == 'accommodation' ? this.accommodations : (this.productType == 'driver' ? this.drivers : this.cars)).find(v => v?.id == value);
          // console.log({product});

          const active_reservations: any[] = product?.active_reservations || [];
          const inputs = this.inputs;
          let disabledDates: any[] = [];
          if (active_reservations.length > 0) {
            active_reservations.forEach((v: any) => {
              const reservationDates = this.shared.getDatesBetween(new Date(v?.start_at), new Date(v?.end_at));
              disabledDates = [...disabledDates, ...reservationDates];
            });
          }
          const disabledDays: DayConfig[] = [];
          active_reservations.forEach(async (v: any) => {
            const reservationDates = this.shared.getDatesBetween(new Date(v?.start_at), new Date(v?.end_at));
            if (reservationDates.length > 0) {
              const firstDay = reservationDates[0];
              const lastDay = reservationDates[reservationDates.length - 1];
              reservationDates.forEach(async (day) => {
                disabledDays.push({
                  date: day,
                  disable: this.productType == 'accommodation' ? false : ([firstDay, lastDay].includes(day) ? false : true),
                  subTitle: await this.shared.trans('reserved')
                });
              });
            }
          });

          inputs[inputs.findIndex(v => v.name == 'reservation_date')].dateRangeOptions = { daysConfig: disabledDays };
          pop.componentProps = { ...pop.componentProps, ...{ inputs: inputs } };
          let formData: Record<string, any> = {
            price: product?.price
          };
          this.events.publish({ name: EVENTS.setFormData, data: formData });
        }
      },
      {
        name: 'reservation_date',
        type: 'dateRange',
        title: await this.shared.trans('reservation_date'),
        value: data?.reservation_date,
        min: min_date,
        required: true
      },
      {
        name: 'price',
        type: 'number',
        title: await this.shared.trans('price'),
        value: data?.price || 0,
        required: true,
        min: 0
      },
    ];
    if (this.productType == 'driver') {
      inputs.push({
        name: 'extra',
        type: 'select',
        title: await this.shared.trans('car'),
        value: data?.extra || null,
        options: this.cars,
        required: false,
      });
    }
    inputs.push({
      name: 'note',
      type: 'textarea',
      title: await this.shared.trans('note'),
      value: data?.note || null,
      required: false
    });
    this.inputs = inputs;
    const pop = await this.popoverCtrl.create({
      component: EditPagePage,
      cssClass: 'editpage-popover',
      backdropDismiss: false,
      dismissOnSelect: false
    });
    pop.componentProps = {
      pop,
      inputs: this.inputs,
      title: await this.shared.trans('add'),
      errors: errors || []
    };
    pop.onDidDismiss().then(async v => {
      this.randomToken = Math.random() * 1000;
      if (v.role === 'success') {
        const loading = await this.shared.loading({ message: await this.shared.trans('common.saving') });
        const data: any = v.data;
        data.order_id = this.order?.id;
        data.type = this.productType;
        data.start_at = data?.reservation_date?.from?.string;
        data.end_at = data?.reservation_date?.to?.string;
        const resp = await this.api.orderProductsCreate(data);
        loading.dismiss();
        if (!resp?.status) {
          this.add(v.data, resp?.data?.errors);
        }
        this.refresh(true, false);
        this.OnChange.emit(true);
      }
    });
    pop.present();
  }

  async edit(id: number, data?: any, errors?: any) {
    let products = [];
    if (this.productType == 'accommodation') {
      products = this.accommodations.map(v => { return { id: v?.id, name: v?.name, image: v?.image_url?.url } });
    } else if (this.productType == 'driver') {
      products = this.drivers.map(v => { return { id: v?.id, name: v?.name, image: v?.image_url?.url } });
    } else {
      products = this.cars.map(v => { return { id: v?.id, name: v?.name, image: v?.image_url?.url } });
    }

    const index = this.items.findIndex(v => v?.id == id);
    let isFirst = true;
    let min_date = new Date(new Date().getTime() - (60 * 60 * 24 * 30 * 12 * 1000));
    const inputs: CustomInput[] = [
      {
        name: 'item_id',
        type: 'select',
        title: await this.shared.trans(this.productType),
        value: parseInt(data?.item_id) || parseInt(this.items[index]?.item_id) || null,
        options: products,
        required: true,
        changed: (newValue: any) => {
          const value = newValue?.detail?.value;
          const product = (this.productType == 'accommodation' ? this.accommodations : this.cars).find(v => v?.id == value);
          const active_reservations: any[] = product?.active_reservations || [];
          const inputs = this.inputs;
          let disabledDates: any[] = [];
          if (active_reservations.length > 0) {
            active_reservations.forEach((v: any, i) => {
              disabledDates = [...disabledDates, ...this.shared.getDatesBetween(new Date(v?.start_at), new Date(v?.end_at))];
            });
          }
          const disabledDays: DayConfig[] = [];
          disabledDates?.forEach(async (day, index) => {
            disabledDays.push({
              date: day,
              disable: this.productType == 'accommodation' ? false : ([0, disabledDates.length - 1].includes(index) ? false : true),
              subTitle: await this.shared.trans('reserved')
            });
          });

          inputs[inputs.findIndex(v => v.name == 'reservation_date')].dateRangeOptions = { daysConfig: disabledDays };
          this.pop.componentProps = { ...this.pop.componentProps, ...{ inputs: inputs } };
          if (!isFirst) {
            let formData: Record<string, any> = {
              price: product?.price
            };
            this.events.publish({ name: EVENTS.setFormData, data: formData });
          }
          isFirst = false;
        }
      },
      {
        name: 'reservation_date',
        type: 'dateRange',
        title: await this.shared.trans('reservation_date'),
        value: data?.reservation_date || { from: { dateObj: new Date(this.items[index]?.start_at), string: this.datePipe.transform(this.items[index]?.start_at, 'YYYY-MM-dd') }, to: { dateObj: new Date(this.items[index]?.end_at), string: this.datePipe.transform(this.items[index]?.end_at, 'YYYY-MM-dd') } },
        min: min_date,
        required: true
      },
      {
        name: 'price',
        type: 'number',
        title: await this.shared.trans('price'),
        value: data?.price || this.items[index]?.price || 0,
        required: true,
        min: 0
      },
    ];

    if (this.productType == 'driver') {
      inputs.push({
        name: 'extra',
        type: 'select',
        title: await this.shared.trans('car'),
        value: parseInt(data?.extra) || parseInt(this.items[index]?.extra) || null,
        options: this.cars.map(v => { return { id: v?.id, name: v?.name, image: v?.image_url?.url } }),
        required: true,
      });
    }

    inputs.push({
      name: 'note',
      type: 'textarea',
      title: await this.shared.trans('note'),
      value: data?.note || this.items[index]?.note || null,
      required: false
    });

    this.inputs = inputs;
    this.pop = await this.popoverCtrl.create({
      component: EditPagePage,
      cssClass: 'editpage-popover',
      backdropDismiss: false,
      dismissOnSelect: false,
    });
    this.pop.componentProps = {
      pop: this.pop,
      inputs: this.inputs,
      errors: errors || []
    };
    this.pop.onDidDismiss().then(async v => {
      this.randomToken = Math.random() * 1000;
      if (v.role == 'data') {

        return;
      }
      if (v.role === 'success') {
        const loading = await this.shared.loading({ message: await this.shared.trans('common.saving') });
        const data: any = v.data;
        data.order_id = this.order?.id;
        data.type = this.productType;
        data.start_at = data?.reservation_date?.from?.string;
        data.end_at = data?.reservation_date?.to?.string;
        const resp = await this.api.orderProductsUpdate(this.items[index]?.id, data);
        loading.dismiss();
        if (!resp?.status) {
          this.edit(id, data, resp?.data?.errors);
        }
        this.refresh(true, false);
        this.OnChange.emit(true);
      }
    });
    this.pop.present();
  }
  async remove(id: number) {
    const trans = await this.shared.trans([
      'common.confirmation',
      'common.confirm-message',
      'common.remove-success',
      'common.yes',
      'common.no',
    ]);
    this.shared.alert({
      header: trans['common.confirmation'],
      message: trans['common.confirm-message'],
      buttons: [
        {
          text: trans['common.yes'],
          handler: async () => {
            await this.api.orderProductsDelete(id);
            this.shared.toast({ message: trans['common.remove-success'], color: 'success', duration: 1500 });
            this.refresh(true, false);
            this.OnChange.emit(true);
          }
        },
        {
          text: trans['common.no']
        }
      ]
    });
  }

  // =============================================

  async addPayment(data?: any, errors?: any) {
    const loading = await this.shared.loading({ message: await this.shared.trans('common.loading') });
    loading.dismiss();
    const inputs: CustomInput[] = [
      {
        name: 'amount',
        type: 'number',
        title: await this.shared.trans('amount'),
        value: data?.amount || null,
        required: true,
        min: 1
      },
      {
        name: 'currency',
        type: 'select',
        title: await this.shared.trans('currency'),
        value: data?.currency || 'EUR',
        options: ['EUR', 'BAM', 'USD'].map(v => { return { id: v, name: v }; }),
        required: true,
      },
      {
        name: 'paid_at',
        type: 'date',
        title: await this.shared.trans('paid_at'),
        value: data?.paid_at || this.datePipe.transform(new Date(), 'YYYY-MM-dd'),
        required: true,
        min: new Date(new Date().getTime() - (60 * 60 * 24 * 30 * 1000))
      },
      {
        name: 'type',
        type: 'select',
        title: await this.shared.trans('payment_type'),
        value: data?.type || 'payment',
        options: ['payment', 'deposit'].map(v => { return { id: v, name: v }; }),
        required: true,
      },
      {
        name: 'note',
        type: 'textarea',
        title: await this.shared.trans('note'),
        value: data?.note || null,
        required: false
      }
    ];
    this.inputs = inputs;
    const pop = await this.popoverCtrl.create({
      component: EditPagePage,
      cssClass: 'editpage-popover',
      backdropDismiss: false,
      dismissOnSelect: false
    });
    pop.componentProps = {
      pop,
      inputs: this.inputs,
      title: await this.shared.trans('add'),
      errors: errors || []
    };
    pop.onDidDismiss().then(async v => {
      this.randomToken = Math.random() * 1000;
      if (v.role === 'success') {
        const loading = await this.shared.loading({ message: await this.shared.trans('common.saving') });
        const data: any = v.data;
        data.order_id = this.order?.id;
        const resp = await this.api.orderPaymentsCreate(data);
        loading.dismiss();
        if (!resp?.status) {
          this.addPayment(v.data, resp?.data?.errors);
        }
        this.refresh(true, false);
        this.OnChange.emit(true);
      }
    });
    pop.present();
  }

  async editPayment(id: number, data?: any, errors?: any) {

    const index = this.paymentsItems.findIndex(v => v?.id == id);

    const inputs: CustomInput[] = [
      {
        name: 'amount',
        type: 'number',
        title: await this.shared.trans('amount'),
        value: data?.amount || this.paymentsItems[index]?.amount || null,
        required: true,
        min: 1
      },
      {
        name: 'currency',
        type: 'select',
        title: await this.shared.trans('currency'),
        value: data?.currency || this.paymentsItems[index]?.currency || 'EUR',
        options: ['EUR', 'BAM', 'USD'].map(v => { return { id: v, name: v }; }),
        required: true,
      },
      {
        name: 'paid_at',
        type: 'date',
        title: await this.shared.trans('paid_at'),
        value: data?.paid_at || this.paymentsItems[index]?.paid_at || null,
        required: true,
        min: new Date(new Date().getTime() - (60 * 60 * 24 * 30 * 1000))
      },
      {
        name: 'type',
        type: 'select',
        title: await this.shared.trans('payment_type'),
        value: data?.type || this.paymentsItems[index]?.type || 'payment',
        options: ['payment', 'deposit'].map(v => { return { id: v, name: v }; }),
        required: true,
      },
      {
        name: 'note',
        type: 'textarea',
        title: await this.shared.trans('note'),
        value: data?.note || this.paymentsItems[index]?.note || null,
        required: false
      }
    ];

    this.inputs = inputs;
    this.pop = await this.popoverCtrl.create({
      component: EditPagePage,
      cssClass: 'editpage-popover',
      backdropDismiss: false,
      dismissOnSelect: false,
    });
    this.pop.componentProps = {
      pop: this.pop,
      inputs: this.inputs,
      errors: errors || []
    };
    this.pop.onDidDismiss().then(async v => {
      this.randomToken = Math.random() * 1000;
      if (v.role === 'success') {
        const loading = await this.shared.loading({ message: await this.shared.trans('common.saving') });
        const data: any = v.data;
        const resp = await this.api.orderPaymentsUpdate(this.paymentsItems[index]?.id, data);
        loading.dismiss();
        if (!resp?.status) {
          this.editPayment(id, data, resp?.data?.errors);
        }
        this.refresh(true, false);
        this.OnChange.emit(true);
      }
    });
    this.pop.present();
  }

  async removePayment(id: number) {
    const trans = await this.shared.trans([
      'common.confirmation',
      'common.confirm-message',
      'common.remove-success',
      'common.yes',
      'common.no',
    ]);
    this.shared.alert({
      header: trans['common.confirmation'],
      message: trans['common.confirm-message'],
      buttons: [
        {
          text: trans['common.yes'],
          handler: async () => {
            await this.api.orderPaymentsDelete(id);
            this.shared.toast({ message: trans['common.remove-success'], color: 'success', duration: 1500 });
            this.refresh(true, false);
            this.OnChange.emit(true);
          }
        },
        {
          text: trans['common.no']
        }
      ]
    });
  }

}
