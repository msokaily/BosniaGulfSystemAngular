import { Component, HostListener, OnInit, input } from '@angular/core';
import { CustomInput, SharedService } from '../services/shared.service';
import { IonPopover } from '@ionic/angular';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.page.html',
  styleUrls: ['./filter.page.scss'],
})
export class FilterPage implements OnInit {

  pop!: IonPopover;

  title = null;
  
  filters: CustomInput[] = [];

  constructor(
    private shared: SharedService,
    private datePipe: DatePipe
  ) { }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    this.pop.dismiss(false, 'backButton', false);
  }

  ngOnInit() {
    this.shared.clearNavHistory();
  }

  submit() {
    let ret: any = {};
    this.filters.forEach((elm, index) => {
      if (elm?.value) {
        ret[elm.name] = elm?.value;
      }
    });
    this.pop.dismiss(ret, 'success');
  }

  clear() {
    this.pop.dismiss(null, 'success');
  }

  close() {
    this.shared.backNavHistory();
    this.pop.dismiss(null, 'closed');
  }

}
