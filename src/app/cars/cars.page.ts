import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { ApiService } from '../services/api/api.service';
import { CustomInput, SharedService } from '../services/shared.service';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { PopoverController } from '@ionic/angular';
import { FilterPage } from '../filter/filter.page';
import { EditPagePage } from '../edit-page/edit-page.page';

@Component({
  selector: 'app-cars',
  templateUrl: './cars.page.html',
  styleUrls: ['./cars.page.scss'],
})
export class CarsPage implements OnInit {

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
    const resp = await this.api.cars(this.filterValues || {});
    if (resp) {
      this.items = resp;
    }
    this.loadingIndicator = false;
  }

  async add(data?: any) {
    const carCompanies = await this.api.carCompanies();
    const inputs: CustomInput[] = [
      {
        name: 'name',
        type: 'text',
        title: await this.shared.trans('name'),
        value: data?.name || '',
        required: true
      },
      {
        name: 'company',
        type: 'select',
        title: await this.shared.trans('company'),
        options: carCompanies ? carCompanies.map((v:any) => { return { id: v?.id, name: v?.name }; }) : [],
        value: data?.company || null,
        required: true
      },
      {
        name: 'model',
        type: 'text',
        title: await this.shared.trans('model'),
        value: data?.model || ''
      },
      {
        name: 'cost',
        type: 'text',
        title: await this.shared.trans('cost'),
        value: data?.cost || '',
        required: true
      },
      {
        name: 'price',
        type: 'text',
        title: await this.shared.trans('price'),
        value: data?.price || '',
        required: true
      },
      {
        name: 'register_no',
        type: 'text',
        title: await this.shared.trans('register_no'),
        value: data?.register_no || ''
      },
      {
        name: 'register_start',
        type: 'date',
        format: 'YYYY-MM-dd',
        title: await this.shared.trans('register_start'),
        value: data?.register_start || ''
      },
      {
        name: 'register_end',
        type: 'date',
        format: 'YYYY-MM-dd',
        title: await this.shared.trans('register_end'),
        value: data?.register_end || ''
      },
      {
        name: 'image',
        type: 'file',
        title: await this.shared.trans('image'),
        value: data?.image || null,
      }
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
      title: await this.shared.trans('add')
    };
    pop.onDidDismiss().then(async v => {
      this.randomToken = Math.random() * 1000;
      if (v.role === 'success') {
        const resp = await this.api.carsCreate(v.data);
        if (!resp) {
          this.add(v.data);
        }
        this.refresh(true);
      }
    });
    pop.present();
  }

  async edit(index: number) {
    const carCompanies = await this.api.carCompanies();
    const inputs: CustomInput[] = [
      {
        name: 'name',
        type: 'text',
        title: await this.shared.trans('name'),
        value: this.items[index]?.name || ''
      },
      {
        name: 'company',
        type: 'select',
        title: await this.shared.trans('company'),
        options: carCompanies ? carCompanies.map((v:any) => { return { id: v?.id, name: v?.name }; }) : [],
        value: this.items[index]?.company?.id || null,
      },
      {
        name: 'model',
        type: 'text',
        title: await this.shared.trans('model'),
        value: this.items[index]?.model || ''
      },
      {
        name: 'cost',
        type: 'text',
        title: await this.shared.trans('cost'),
        value: this.items[index]?.cost || ''
      },
      {
        name: 'price',
        type: 'text',
        title: await this.shared.trans('price'),
        value: this.items[index]?.price || ''
      },
      {
        name: 'register_no',
        type: 'text',
        title: await this.shared.trans('register_no'),
        value: this.items[index]?.register_no || ''
      },
      {
        name: 'register_start',
        type: 'date',
        title: await this.shared.trans('register_start'),
        format: 'YYYY-MM-dd',
        value: this.items[index]?.register_start || ''
      },
      {
        name: 'register_end',
        type: 'date',
        format: 'YYYY-MM-dd',
        title: await this.shared.trans('register_end'),
        value: this.items[index]?.register_end || ''
      },
      {
        name: 'image',
        type: 'file',
        title: await this.shared.trans('image'),
        value: this.items[index]?.image || null,
      }
    ];
    const pop = await this.popoverCtrl.create({
      component: EditPagePage,
      cssClass: 'editpage-popover',
      backdropDismiss: false,
      dismissOnSelect: false
    });
    pop.componentProps = {
      pop,
      inputs
    };
    pop.onDidDismiss().then(async v => {
      this.randomToken = Math.random() * 1000;
      if (v.role === 'success') {
        const resp = await this.api.carsUpdate(this.items[index]?.id, v.data);
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
            console.log('remove Item: ', item);
            this.items.splice(index, 1);
            this.api.carsDelete(item?.id);
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
    const carCompanies = await this.api.carCompanies();
    const filters: CustomInput[] = [
      {
        name: 'search',
        type: 'text',
        title: await this.shared.trans('search'),
        value: this.filterValues?.search || ''
      },
      {
        name: 'register_end',
        type: 'date',
        title: await this.shared.trans('register_end'),
        value: this.filterValues?.register_end || undefined
      },
      {
        name: 'company',
        type: 'select',
        title: await this.shared.trans('company'),
        options: carCompanies ? carCompanies.map((v:any) => { return { id: v?.id, name: v?.name }; }) : [],
        value: this.filterValues?.company || null,
        multiple: true
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
