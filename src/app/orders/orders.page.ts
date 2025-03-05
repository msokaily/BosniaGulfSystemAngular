import { Component, OnInit } from '@angular/core';
import { CustomInput, SharedService } from '../services/shared.service';
import { FilterPage } from '../filter/filter.page';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { ApiService } from '../services/api/api.service';
import { PopoverController } from '@ionic/angular';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { EVENTS, EventsService } from '../services/events/events.service';
import { DatePipe } from '@angular/common';
import { CanPipe } from '../can.pipe';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit {

  pageName = 'orders';
  
  filterValues: any;
  items: any[] = [];

  ColumnMode = ColumnMode;

  loadingIndicator = false;

  randomToken = 1;

  selectedYear: number = 0;
  selectedMonth: number = 0;

  cars: any[] = [];
  accommodations: any[] = [];
  drivers: any[] = [];

  constructor(
    private auth: AuthenticationService,
    private api: ApiService,
    public shared: SharedService,
    private popoverCtrl: PopoverController,
    private events: EventsService,
    private datePipe: DatePipe,
    private canPipe: CanPipe
  ) {
    this.events.listen.subscribe(resp => {
      if (resp.name == EVENTS.refreshOrders) {
        this.refresh(true);
      }
    });
  }

  get user() {
    return this.auth.user;
  }
  
  get selectedDate() {
    const d = new Date();
    if (this.selectedYear) {
      d.setFullYear(this.selectedYear);
    }
    if (this.selectedMonth) {
      d.setMonth(this.selectedMonth);
    }
    return this.datePipe.transform(d, 'Y MMMM');
  }

  async ngOnInit() {
    this.loadingIndicator = true;
    const nowDate = new Date();
    this.selectedYear = nowDate.getFullYear();
    this.selectedMonth = nowDate.getMonth();
    const respAccommodations = await this.api.accommodations({});
    if (respAccommodations) { this.accommodations = respAccommodations.map((v: any) => { return { id: v?.id, name: v?.name, image: v?.image_url?.url } }); };
    const respCars = await this.api.cars({});
    if (respCars) { this.cars = respCars.map((v: any) => { return { id: v?.id, name: v?.name, image: v?.image_url?.url } }); };
    const respDrivers = await this.api.drivers({});
    if (respDrivers) { this.drivers = respDrivers.map((v: any) => { return { id: v?.id, name: v?.name, image: v?.image_url?.url } }); };

    // console.log({accommodations: this.accommodations, cars: this.cars, drivers: this.drivers});

    this.refresh();
  }

  async refresh(hideLoading = false) {
    if (!hideLoading) {
      this.loadingIndicator = true;
    }
    const params = {...(this.filterValues ?? {}), ...{year: this.selectedYear, month: this.selectedMonth + 1}}
    const resp = await this.api.orders(params);
    if (resp) {
      this.items = resp;
    }
    this.loadingIndicator = false;
  }

  async add() {
    this.shared.navRoute('new-order');
  }

  async edit(id: number) {
    this.shared.navRoute('view-order', [id]);
  }
  async remove(index: number) {
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
            const item = this.items[index];
            this.items = this.items.filter(v => v.id !== item.id);
            this.api.ordersDelete(item?.id);
            this.shared.toast({message: trans['common.remove-success'], color: 'success', duration: 1500});
          }
        },
        {
          text: trans['common.no']
        }
      ]
    });
  }

  async openFilter() {
    const orderStatus = (await this.api.constants())?.order_status;
    const filters: CustomInput[] = [
      {
        name: 'month',
        type: 'date',
        title: await this.shared.trans('the_month'),
        value: this.filterValues?.month ? this.filterValues?.month : this.datePipe.transform(new Date(), 'Y-MM-dd'),
        format: 'Y-MM',
        // max: this.datePipe.transform(new Date(), 'Y-MM')
      },
      {
        name: 'search',
        type: 'text',
        title: await this.shared.trans('search'),
        value: this.filterValues?.search || ''
      },
      {
        name: 'status',
        type: 'select',
        title: await this.shared.trans('status'),
        value: this.filterValues?.status || null,
        options: orderStatus.map((v: any, i: number) => { return {id: i, name: v[this.shared.lang]}; }),
        multiple: true
      },
      {
        name: 'accommodation_ids',
        type: 'select',
        title: await this.shared.trans('accommodations'),
        value: this.filterValues?.accommodation_ids || null,
        options: this.accommodations,
        multiple: true,
      },
      {
        name: 'car_ids',
        type: 'select',
        title: await this.shared.trans('cars'),
        value: this.filterValues?.car_ids || null,
        options: this.cars,
        multiple: true,
      },
      {
        name: 'driver_ids',
        type: 'select',
        title: await this.shared.trans('drivers'),
        value: this.filterValues?.driver_ids || null,
        options: this.drivers,
        multiple: true,
      },
    ];
    const pop = await this.popoverCtrl.create({
      component: FilterPage,
      cssClass: 'filter-popover',
      backdropDismiss: true,
    });
    pop.componentProps = {
      pop,
      filters
    };
    pop.onDidDismiss().then(v => {
      this.randomToken = Math.random() * 1000;
      if (v.role === 'success') {
        this.filterValues = v.data;
        if (this.filterValues) {
          const monthDate = new Date(this.filterValues?.month);
          this.selectedYear = monthDate.getFullYear();
          this.selectedMonth = monthDate.getMonth();
        } else {
          const monthDate = new Date();
          this.selectedYear = monthDate.getFullYear();
          this.selectedMonth = monthDate.getMonth();
        }
        this.refresh();
      }
    });
    pop.present();
  }

  statusColor(status: any) {
    switch (status) {
      case '0':
        return 'warning';
        break;
      case '1':
        return 'primary';
        break;
      case '2':
        return 'success';
        break;
      case '3':
        return 'medium';
        break;
      case '4':
        return 'danger';
        break;
    
      default:
        return 'dark';
        break;
    }
  }

  orderProducts(prods: [], type = 'car'): any[] {
    return prods.filter((v: any) => v?.type == type);
  }

  checkPermission(perm: string[], row: any) {
    return (this.canPipe.transform(this.pageName, perm) && row?.user_id === this.user?.id) || this.user?.role == 'admin';
  }

  printBill(item: any) {
    const url = `${this.api.siteUrl}print/${item?.id}`;
    window.open(url, "_blank");
  }

  rowClass(item: any) {
    let classes = ['order-row-flex'];
    if (item?.paid == 1) {
      classes.push('paid-cell');
    } 
    return classes.join(' ');
  }

  paidClass({ value }: any) {
    return value == 1 ? 'paid-cell' : '';
  }

  openExportExcel() {
    window.open(this.api.export_orders_excel({year: this.selectedYear, month: this.selectedMonth + 1}), "_blank");
  }

}
