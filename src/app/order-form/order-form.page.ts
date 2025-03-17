import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api/api.service';
import { CustomInput, SharedService } from '../services/shared.service';
import { DatePipe } from '@angular/common';
import { DynamicFormPage } from '../dynamic-form/dynamic-form.page';
import { EVENTS, EventsService } from '../services/events/events.service';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { PopoverController, PopoverOptions } from '@ionic/angular';
import { EditPagePage } from '../edit-page/edit-page.page';

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.page.html',
  styleUrls: ['./order-form.page.scss'],
})
export class OrderFormPage implements OnInit {

  isEdit = false;

  inputs: CustomInput[] = [];
  inputsProducts: CustomInput[] = [];

  order: any;

  orderForm!: DynamicFormPage;
  productsForm!: DynamicFormPage;

  formData: any;
  productsFormData: any[] = [];

  orderStatus: any[] = [];
  extraServices: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private auth: AuthenticationService,
    private shared: SharedService,
    private datePipe: DatePipe,
    private events: EventsService,
    private popoverCtrl: PopoverController
  ) { }

  get user() {
    return this.auth.user;
  }

  get canEdit() {
    return (this.isEdit && (this.user?.id === this.order?.user_id || ['admin'].includes(this.user?.role))) || !this.isEdit;
  }

  get paymentsSum() {
    return {
      'EUR': this.order?.payments?.filter((v: any) => v?.currency == 'EUR' && v?.type != 'deposit')?.reduce((prev: number, curr: any) => { return prev + parseFloat(curr?.amount) }, 0) || 0,
      'BAM': this.order?.payments?.filter((v: any) => (v?.currency == 'BAM' || v?.currency == 'KM') && v?.type != 'deposit')?.reduce((prev: number, curr: any) => { return prev + parseFloat(curr?.amount) }, 0) || 0,
      'USD': this.order?.payments?.filter((v: any) => v?.currency == 'USD' && v?.type != 'deposit')?.reduce((prev: number, curr: any) => { return prev + parseFloat(curr?.amount) }, 0) || 0,
    };
  }

  get deposit() {
    return this.order?.payments?.filter((v: any) => v?.currency == 'EUR' && v?.type == 'deposit')?.reduce((prev: number, curr: any) => { return prev + parseFloat(curr?.amount) }, 0) || 0;
  }

  async ngOnInit(hideLoading = false) {
    const order_id = this.route.snapshot.params['id'] ?? false;
    const loading = await this.shared.loading({ message: await this.shared.trans('common.loading') });
    if (hideLoading) {
      loading.dismiss();
    }
    if (order_id) {
      this.order = await this.api.ordersView(order_id);
      if (this.order) {
        this.isEdit = true;
      }
    }
    this.orderStatus = (await this.api.constants())?.order_status;

    this.extraServices = (await this.api.extraServices()) ?? [];

    loading.dismiss();

    let readonly = false;

    if (!this.canEdit) {
      readonly = true;
    }
    let min_date = new Date(new Date().getTime() - (60 * 60 * 24 * 30 * 12 * 1000));

    this.inputs = [
      {
        name: 'id',
        type: 'hidden',
        title: await this.shared.trans('order_id'),
        value: this.order?.id || '',
        required: false,
        readonly,
        colSize: 4
      },
      {
        name: 'name',
        type: 'text',
        title: await this.shared.trans('name'),
        value: this.order?.name || '',
        required: true,
        readonly,
        colSize: 3
      },
      {
        name: 'phone',
        type: 'text',
        title: await this.shared.trans('phone'),
        value: this.order?.phone || '',
        required: true,
        readonly,
        colSize: 2.5
      },
      {
        name: 'status',
        type: 'select',
        title: await this.shared.trans('status'),
        value: this.order?.status >= 0 ? parseInt(this.order?.status) : 0,
        options: this.orderStatus.map((v, i) => { return { id: i, name: v[this.shared.lang] }; }),
        readonly,
        colSize: 2.5
      },
      {
        name: 'extra_services',
        type: 'select',
        title: await this.shared.trans('extra-services'),
        value: this.order?.extra_services?.length > 0 ? this.order?.extra_services.map((v: any) => v.id) : [],
        options: this.extraServices.map((v) => { return { id: v.id, name: `${v.name} (${v.price} ${this.shared.currency})` }; }),
        multiple: true,
        readonly,
        colSize: 4
      },
      {
        name: 'arrive_at',
        type: 'date',
        format: 'dd-MM-YYYY',
        title: await this.shared.trans('arrive_at'),
        value: this.order?.arrive_at || '',
        required: true,
        min: min_date,
        readonly,
        colSize: 2.4
      },
      {
        name: 'arrive_time',
        type: 'time',
        format: 'HH:mm',
        title: await this.shared.trans('arrive_time'),
        value: this.order?.arrive_time || '',
        required: true,
        readonly,
        colSize: 2.4
      },
      {
        name: 'leave_at',
        type: 'native-date',
        format: 'dd-MM-YYYY',
        title: await this.shared.trans('leave_at'),
        value: this.order?.leave_at || '',
        min: min_date,
        readonly,
        colSize: 2.4
      },
      {
        name: 'airline',
        type: 'text',
        title: await this.shared.trans('airline'),
        value: this.order?.airline || '',
        readonly,
        colSize: 2.4
      },
      {
        name: 'paid',
        type: 'select',
        title: await this.shared.trans('paid'),
        value: this.order?.paid || 0,
        readonly: this.user?.role == 'accountant' ? false : readonly,
        colSize: 2.4,
        options: [
          {
            id: 1,
            name: await this.shared.trans('paid')
          },
          {
            id: 0,
            name: await this.shared.trans('not_paid')
          }
        ],
        changed: async (newValue) => {
          if (this.user?.role == 'accountant') {
            try {
              await this.form1Submitted({name: this.order?.name, paid: newValue?.detail?.value ?? this.order?.paid}, false);
              this.ngOnInit(true);
            } catch (error) {
            }
          }
        },
      },
    ];

  }

  compObject1(formComponent: DynamicFormPage) {
    this.orderForm = formComponent;
  }
  async form1Submitted(data: any, goBack = true) {
    this.formData = data;
    const loading = await this.shared.loading({ message: await this.shared.trans('common.saving') });
    let respOrder: any;
    if (this.isEdit) {
      respOrder = await this.api.ordersUpdate(this.order?.id, this.formData);
      if (goBack) {
        this.shared.navRouteBack('orders');
      }
      this.events.publish({ name: EVENTS.refreshOrders });
    } else {
      respOrder = await this.api.ordersCreate(this.formData);
      this.shared.navRouteRoot('view-order', [respOrder?.data?.id]);
    }
    loading.dismiss();
  }
  orderProductsChanged() {
    this.ngOnInit(true);
    this.events.publish({ name: EVENTS.refreshOrders });
  }
  async submit() {
    this.orderForm.submit();
  }

  async editOrderTotal(data: any = {}, errors: any = []) {
    if (!this.canEdit) return;
    const inputs: CustomInput[] = [
      {
        name: 'total_special',
        type: 'text',
        title: await this.shared.trans('price'),
        value: data?.total_special || this.order?.total_special || '',
      },
    ];
    const pop = await this.popoverCtrl.create({
      component: EditPagePage,
      cssClass: 'editpage-popover',
      backdropDismiss: false,
      dismissOnSelect: false
    });
    pop.componentProps = {
      pop,
      inputs,
      errors
    };
    pop.onDidDismiss().then(async v => {
      if (v.role === 'success') {
        const formData: any = v.data;
        formData.name = this.order?.name;
        await this.form1Submitted(formData);
        // const loading = await this.shared.loading({ message: await this.shared.trans('common.saving') });
        // const resp = await this.api.carsUpdate(this.items[index]?.id, v.data);
        // loading.dismiss();
        // if (!resp?.status) {
        //   this.editOrderTotal(v.data, resp?.data?.errors);
        // }
        this.ngOnInit();
      }
    });
    pop.present();
  }

  async showLogs() {
    let rows: string[] = [];
    for (const index in this.order?.logs) {
      const itm = this.order?.logs[index];
      let updatesData: string[] = [];
      for (const key in itm?.data) {
        if (Object.prototype.hasOwnProperty.call(itm?.data, key)) {
          let elm = itm?.data[key];
          if (key == 'status') {
            elm = itm?.data['status_name'];
          }
          if (key !== 'status_name') {
            updatesData.push(`<li style="margin-bottom: 4px;"><b>${await this.shared.trans(key)}</b>: ${elm}</li>`);
          }
        }
      }
      rows.push(`<tr>
        <td>${parseInt(index) + 1}</td>
        <td>${itm?.user?.name || '-'}</td>
        <td>${itm?.type}</td>
        <td><b>${itm?.item?.id ?? '-'}</b> ${itm?.item_product?.name || itm?.item?.name ? '-' + (itm?.item_product?.name || itm?.item?.name) : ''}</td>
        <td class="log-data-col"><ol class="ion-no-margin ion-no-padding ion-padding-start">${updatesData.join('')}</ol></td>
        <td>${itm?.created_at ? this.datePipe.transform(itm?.created_at, 'Y-MM-dd HH:mm:ss') : '-'}</td>
      </tr>`);
    }
    const alert = await this.shared.alert_({
      title: await this.shared.trans('history'),
      message: `<table>
        <thead>
          <tr>
            <th style="width: 50px;">${await this.shared.trans('no.')}</th>
            <th style="width: 200px;">${await this.shared.trans('name')}</th>
            <th style="width: 150px;">${await this.shared.trans('activity_type')}</th>
            <th style="width: 200px;">${await this.shared.trans('item')}</th>
            <th class="log-data-col">${await this.shared.trans('updates')}</th>
            <th style="width: 200px;">${await this.shared.trans('updated_at')}</th>
          </tr>
        </thead>
        <tbody>
          ${rows.join('')}
        </tbody>
      </table>`,
    }, { cssClass: 'popup-info logs-popup' } as PopoverOptions);
  }

}
