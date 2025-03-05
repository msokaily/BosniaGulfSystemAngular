import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api/api.service';
import { DatePipe } from '@angular/common';
import { CustomInput, SharedService } from '../services/shared.service';
import { PopoverController } from '@ionic/angular';
import { FilterPage } from '../filter/filter.page';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  stats: any;

  loadingIndicator = false;

  selectedYear: number = 0;
  selectedMonth: number = 0;

  filterValues: any;
  randomToken = 1;
  
  constructor(
    private api: ApiService,
    private datePipe: DatePipe,
    private shared: SharedService,
    private popoverCtrl: PopoverController,
  ) { }

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

  ngOnInit() {
    const nowDate = new Date();
    this.selectedYear = nowDate.getFullYear();
    this.selectedMonth = nowDate.getMonth();
    this.refresh();
  }

  async refresh() {
    this.loadingIndicator = true;
    this.stats = await this.api.stats({year: this.selectedYear, month: this.selectedMonth + 1});
    this.loadingIndicator = false;
  }

  async openFilter() {
    const filters: CustomInput[] = [
      {
        name: 'month',
        type: 'date',
        title: await this.shared.trans('the_month'),
        value: this.filterValues?.month ? this.filterValues?.month : this.datePipe.transform(new Date(), 'Y-MM-dd'),
        format: 'Y-MM',
        // max: this.datePipe.transform(new Date(), 'Y-MM')
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
      console.log(v.data);
      
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

}
