import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { ApiService } from '../services/api/api.service';
import { CustomInput, SharedService } from '../services/shared.service';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { PopoverController } from '@ionic/angular';
import { FilterPage } from '../filter/filter.page';
import { EditPagePage } from '../edit-page/edit-page.page';

@Component({
  selector: 'app-drivers',
  templateUrl: './drivers.page.html',
  styleUrls: ['./drivers.page.scss'],
})
export class DriversPage implements OnInit {

  pageName = 'drivers';
  
  permissions: any;
  
  filterValues: any;
  items: any[] = [];

  ColumnMode = ColumnMode;

  loadingIndicator = false;

  randomToken = 1;

  constructor(
    private auth: AuthenticationService,
    private api: ApiService,
    public shared: SharedService,
    private popoverCtrl: PopoverController
  ) { }

  get user() {
    return this.auth.user;
  }
  
  ngOnInit() {
    this.refresh();
  }

  async refresh(hideLoading = false) {
    if (!hideLoading) {
      this.loadingIndicator = true;
    }
    const resp = await this.api.drivers(this.filterValues || {});
    if (resp) {
      this.items = resp;
    }
    this.loadingIndicator = false;
  }

  async add(data?: any, errors?: any) {
    const loading = await this.shared.loading({message: await this.shared.trans('common.loading')});
    const inputs: CustomInput[] = [
      {
        name: 'name',
        type: 'text',
        title: await this.shared.trans('name'),
        value: data?.name || '',
        required: true
      },
      {
        name: 'phone',
        type: 'text',
        title: await this.shared.trans('phone'),
        value: data?.phone || ''
      },
      {
        name: 'cost',
        type: 'number',
        title: await this.shared.trans('cost'),
        value: data?.cost || 0,
        min: 0
      },
      {
        name: 'price',
        type: 'number',
        title: await this.shared.trans('price'),
        value: data?.price || 0,
        min: 0
      },
      {
        name: 'multiple',
        type: 'select',
        title: await this.shared.trans('multiple-save-reserve'),
        note: await this.shared.trans('multiple-save-reserve-note'),
        value: data?.multiple || 1,
        options: [
          {
            id: 1,
            name: await this.shared.trans('common.no')
          },
          {
            id: 2,
            name: await this.shared.trans('common.yes')
          }
        ]
      },
      {
        name: 'status',
        type: 'select',
        title: await this.shared.trans('status'),
        value: data?.status || 1,
        options: [
          {
            id: 1,
            name: await this.shared.trans('active')
          },
          {
            id: 2,
            name: await this.shared.trans('inactive')
          }
        ]
      }
    ];
    loading.dismiss();
    const pop = await this.popoverCtrl.create({
      component: EditPagePage,
      cssClass: 'editpage-popover',
      backdropDismiss: false,
      dismissOnSelect: false
    });
    pop.componentProps = {
      pop,
      inputs,
      title: await this.shared.trans('add'),
      errors
    };
    pop.onDidDismiss().then(async v => {
      this.randomToken = Math.random() * 1000;
      if (v.role === 'success') {
        const loading = await this.shared.loading({message: await this.shared.trans('common.saving')});
        const resp = await this.api.driversCreate(v.data);
        loading.dismiss();
        if (!resp?.status) {
          this.add(v.data, resp?.data?.errors);
        }
        this.refresh(true);
      }
    });
    pop.present();
  }

  async edit(index: number, data?: any, errors?: any) {
    const loading = await this.shared.loading({message: await this.shared.trans('common.loading')});
    const inputs: CustomInput[] = [
      {
        name: 'name',
        type: 'text',
        title: await this.shared.trans('name'),
        value: data?.name || this.items[index]?.name || ''
      },
      {
        name: 'phone',
        type: 'text',
        title: await this.shared.trans('phone'),
        value: data?.phone || this.items[index]?.phone || ''
      },
      {
        name: 'cost',
        type: 'number',
        title: await this.shared.trans('cost'),
        value: data?.cost || this.items[index]?.cost || 0,
        min: 0
      },
      {
        name: 'price',
        type: 'number',
        title: await this.shared.trans('price'),
        value: data?.price || this.items[index]?.price || 0,
        min: 0
      },
      {
        name: 'multiple',
        type: 'select',
        title: await this.shared.trans('multiple-save-reserve'),
        note: await this.shared.trans('multiple-save-reserve-note'),
        value: data?.multiple || this.items[index]?.multiple || 1,
        options: [
          {
            id: 1,
            name: await this.shared.trans('common.no')
          },
          {
            id: 2,
            name: await this.shared.trans('common.yes')
          }
        ]
      },
      {
        name: 'status',
        type: 'select',
        title: await this.shared.trans('status'),
        value: data?.status || parseInt(this.items[index]?.status) || 1,
        options: [
          {
            id: 1,
            name: await this.shared.trans('active')
          },
          {
            id: 2,
            name: await this.shared.trans('inactive')
          }
        ]
      }
    ];
    loading.dismiss();
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
      this.randomToken = Math.random() * 1000;
      if (v.role === 'success') {
        const loading = await this.shared.loading({message: await this.shared.trans('common.saving')});
        const resp = await this.api.driversUpdate(this.items[index]?.id, v.data);
        loading.dismiss();
        if (!resp?.status) {
          this.edit(index, v.data, resp?.data?.errors);
        }
        this.refresh(true);
      }
    });
    pop.present();
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
            this.api.driversDelete(item?.id);
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
    const filters: CustomInput[] = [
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
        options: [
          {
            id: 1,
            name: await this.shared.trans('active')
          },
          {
            id: 2,
            name: await this.shared.trans('inactive')
          }
        ]
      }
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
        this.refresh();
      }
    });
    pop.present();
  }
}
