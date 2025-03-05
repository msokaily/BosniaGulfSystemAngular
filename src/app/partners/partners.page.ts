import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { ApiService } from '../services/api/api.service';
import { CustomInput, SharedService } from '../services/shared.service';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { PopoverController } from '@ionic/angular';
import { FilterPage } from '../filter/filter.page';
import { EditPagePage } from '../edit-page/edit-page.page';

@Component({
  selector: 'app-partners',
  templateUrl: './partners.page.html',
  styleUrls: ['./partners.page.scss'],
})
export class PartnersPage implements OnInit {

  filterValues: any;
  items: any[] = [];

  ColumnMode = ColumnMode;

  loadingIndicator = false;

  randomToken = 1;

  constructor(
    private auth: AuthenticationService,
    private api: ApiService,
    public shared: SharedService,
    private popoverCtrl: PopoverController,
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
    const resp = await this.api.partners(this.filterValues || {});
    if (resp) {
      this.items = resp;
    }
    this.loadingIndicator = false;
  }

  async add(data?: any, errors?: any) {
    const loading = await this.shared.loading({message: await this.shared.trans('common.loading')});
    const constants = await this.api.constants();
    const partnersTypes = await this.shared.trans(["cars", "accommodations"]);
    loading.dismiss();
    const inputs: CustomInput[] = [
      {
        name: 'name',
        type: 'text',
        title: await this.shared.trans('name'),
        value: data?.name || '',
        required: true
      },
      {
        name: 'type',
        type: 'select',
        title: await this.shared.trans('type'),
        options: constants?.partners_types ? constants?.partners_types.map((v:any) => { return { id: v, name: partnersTypes[v] }; }) : [],
        value: data?.type || null,
        required: true
      },
      {
        name: 'contact_name',
        type: 'text',
        title: await this.shared.trans('contact_name'),
        value: data?.contact_name || '',
      },
      {
        name: 'phone',
        type: 'text',
        title: await this.shared.trans('phone'),
        value: data?.phone || '',
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
      title: await this.shared.trans('add'),
      errors
    };
    pop.onDidDismiss().then(async v => {
      this.randomToken = Math.random() * 1000;
      if (v.role === 'success') {
        const loading = await this.shared.loading({message: await this.shared.trans('common.saving')});
        const resp = await this.api.partnersCreate(v.data);
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
    const constants = await this.api.constants();
    const partnersTypes = await this.shared.trans(["cars", "accommodations"]);
    const inputs: CustomInput[] = [
      {
        name: 'name',
        type: 'text',
        title: await this.shared.trans('name'),
        value: data?.name || this.items[index]?.name || '',
        required: true
      },
      {
        name: 'type',
        type: 'select',
        title: await this.shared.trans('type'),
        options: constants?.partners_types ? constants?.partners_types.map((v:any) => { return { id: v, name: partnersTypes[v] }; }) : [],
        value: data?.type || this.items[index]?.type || null,
        required: true
      },
      {
        name: 'contact_name',
        type: 'text',
        title: await this.shared.trans('contact_name'),
        value: data?.contact_name || this.items[index]?.contact_name || '',
      },
      {
        name: 'phone',
        type: 'text',
        title: await this.shared.trans('phone'),
        value: data?.phone || this.items[index]?.phone || '',
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
      this.randomToken = Math.random() * 1000;
      if (v.role === 'success') {
        const loading = await this.shared.loading({message: await this.shared.trans('common.saving')});
        const resp = await this.api.partnersUpdate(this.items[index]?.id, v.data);
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
            this.api.partnersDelete(item?.id);
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
    const constants = await this.api.constants();
    const rolesNames = await this.shared.trans(["admin", "reserver", "accountant", "monitor"]);
    const filters: CustomInput[] = [
      {
        name: 'search',
        type: 'text',
        title: await this.shared.trans('search'),
        value: this.filterValues?.search || ''
      },
      {
        name: 'role',
        type: 'select',
        title: await this.shared.trans('user_type'),
        options: constants?.roles ? constants?.roles.map((v:any) => { return { id: v, name: rolesNames[v] }; }) : [],
        value: this.filterValues?.role || null,
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
