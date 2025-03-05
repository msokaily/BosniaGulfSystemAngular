import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChildren, input } from '@angular/core';
import { CustomInput, SharedService } from '../services/shared.service';
import { IonPopover, ModalController } from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { CalendarComponentOptions, CalendarDay, CalendarModal, CalendarModalOptions, CalendarOptions, CalendarResult, DayConfig } from '@googlproxer/ion-range-calendar';
import { CalendarChange, IonRangeCalendarComponent } from '@googlproxer/ion-range-calendar/lib/components/ion-range-calendar/ion-range-calendar.component';
import { EVENTS, EventsService } from '../services/events/events.service';

@Component({
  selector: 'app-edit-page',
  templateUrl: './edit-page.page.html',
  styleUrls: ['./edit-page.page.scss'],
})
export class EditPagePage implements OnInit {

  @ViewChildren('dateRangeItem') dateRangeItems!: QueryList<ElementRef<IonRangeCalendarComponent>>;

  pop!: IonPopover;

  title = null;

  inputs: CustomInput[] = [];

  form: Record<string, any> = {};

  file: File | undefined;

  errors: any[] = [];

  isFirst = true;

  loading!: HTMLIonLoadingElement;

  dateFieldsPrefix = this.title + '_date_';

  dateRangeOptions: CalendarModalOptions = {
    pickMode: 'range',
    from: new Date(new Date().getTime() - (60 * 60 * 24 * 30 * 1000)),
    maxRange: 30
  };

  tempDateRangeOptions: Record<string, CalendarComponentOptions | undefined> = {};

  constructor(
    private shared: SharedService,
    private datePipe: DatePipe,
    private modalCtrl: ModalController,
    private events: EventsService
  ) {
    this.events.listen.subscribe(ev => {
      if (ev.name == EVENTS.setFormData) {
        this.form = {...this.form, ...ev.data};
      }
    });
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    this.pop.dismiss(false, 'backButton', false);
  }

  get checkValidation() {
    return this.inputs.filter(inp => (inp.required && !this.form[inp.name]) || ( inp.required && inp.type == 'dateRange' && (!this.form[inp.name]?.from || !this.form[inp.name]?.to) )).length > 0 ? false : true;
  }

  ngOnInit() {
    this.shared.clearNavHistory();
    this.prepare();
  }

  prepare() {
    const temp: any = {};
    this.inputs.forEach(async (inp, index) => {
      if (inp.type == 'dateRange') {
        temp[inp.name] = inp?.value || { from: undefined, to: undefined };
      } else if (inp.type == 'date') {
        temp[inp.name] = inp?.value ? this.datePipe.transform(inp?.value, 'YYYY-MM-dd') : this.datePipe.transform(new Date(), 'YYYY-MM-dd');
      } else if (inp.type == 'file') {
        if (typeof (inp?.value) !== "string") {
          temp[inp.name] = inp?.value;
        }
        this.inputs[index].value = await this.fileToUrl(inp?.value);
      } else if (inp?.value !== null) {
        temp[inp.name] = inp?.value;
      }
    });
    this.form = temp;
    setTimeout(() => {
      this.inputs.forEach(inp => {
        if (inp.changed && inp.value !== null) {
          inp.changed({detail: {value: this.form[inp.name]}});
        }
      });
    }, 300);
  }

  async fileToUrl(file: File | string) {
    return new Promise(resolve => {
      if (typeof (file) == "string") {
        resolve(file);
        return;
      }
      const reader = new FileReader();
      reader.addEventListener(
        "load",
        () => {
          // convert image file to base64 string
          resolve(reader.result);
        },
        false,
      );

      if (file) {
        reader.readAsDataURL(file);
      }
    });
  }

  fileChanged(event: any, inputName: any, input: CustomInput) {
    this.form[inputName] = event.event?.target?.files[0];
    if (input?.changed) {
      input.changed(event);
    }
  }

  changedAA(e: any) {
    console.log({e});
    
  }

  async openDateRange(input: CustomInput) {
    let minDate = new Date();

    let options: CalendarModalOptions = {
      pickMode: 'range',
      title: input.title,
      doneLabel: await this.shared.trans('common.done'),
      closeLabel: await this.shared.trans('common.close'),
      clearLabel: await this.shared.trans('common.clear'),
      defaultDateRange: { from: this.form[input.name]?.from?.dateObj, to: this.form[input.name]?.to?.dateObj },
      defaultScrollTo: this.form[input.name]?.from?.dateObj || new Date(),
      from: input?.min || new Date()
    };

    options = { ...options, ...input.dateRangeOptions };
    
    const myCalendar = await this.modalCtrl.create({
      component: CalendarModal,
      componentProps: {
        options,
        ionPage: true,
      }
    });

    myCalendar.present();

    myCalendar.onDidDismiss().then(async resp => {
      this.errors = [];
      if (resp.role == 'done') {
        const date = resp.data;
        const from: CalendarResult = date.from;
        const to: CalendarResult = date.to;
        const disabledDays = options?.daysConfig?.filter(v => v.disable).map(v => v.date.toDateString());
        const fromToDatesList = this.shared.getDatesBetween(from.dateObj, to.dateObj);
        let isAccepted = true;
        
        if (disabledDays) {
          fromToDatesList.forEach((d: Date, index) => {
            if (disabledDays.includes(d.toDateString())) {
              isAccepted = false;
            }
          });
        }
        if (isAccepted) {
          this.form[input.name] = { from: from, to: to };
        } else {
          this.form[input.name] = { from: undefined, to: undefined };
          this.errors.push(await this.shared.trans('not-available-date'));
        }
      }
    });
  }

  getRangeOptions(input: CustomInput) {
    return { ...this.dateRangeOptions, ...input.dateRangeOptions };
  }

  startSelectDateRange(event: any, input: CustomInput) {
    // console.log({start: event});
    const closest = this.checkClosestDisabledDay(input, new Date(event));
    // console.log({closest});
    if (closest) {
      const disabledAfter: DayConfig[] = [];
      let tempDay = new Date(closest);
      for (let i = 0; i < 30; i++) {
        disabledAfter.push({
          date: tempDay,
          disable: true
        });
        tempDay = new Date(this.shared.dateAddDays(tempDay, 1));
      }
      if (input.dateRangeOptions?.daysConfig) {
        this.tempDateRangeOptions[input.name] = { ...this.dateRangeOptions, ...{ daysConfig: [...input.dateRangeOptions?.daysConfig, ...disabledAfter] } };
      }
    } else {
      this.tempDateRangeOptions[input.name] = undefined;
    }
  }
  endSelectDateRange(event: any, input: CustomInput, item?: IonRangeCalendarComponent) {
    // this.tempDateRangeOptions[input.name] = undefined;
    // if (item._d.from && (item._d.to && new Date(item._d.to).getFullYear() != 1970)) {
    //   // item.writeValue({from: null, to: undefined});
    //   item._d.from = event.from;
    //   item._d.to = undefined;
    //   setTimeout(() => {
    //     this.startSelectDateRange(event, input);
    //   }, 300);
    // }
  }

  selectDateRangeChanged(event: any, input: CustomInput) {
    // if (event.from && (!event?.to || event?.to.getFullYear() == 1970)) {
    //   // Start
    //   console.log({ChangedStart : event});
    //   this.startSelectDateRange(event.from, input);
    // } else if(event.from && event.to && this.tempDateRangeOptions[input.name]) {
    //   // End
    //   this.endSelectDateRange(event.to, input);
    // } else if(event.from && event.to) {
    //   // Change again
    //   // this.form[input.name] = {from: event.from, to: undefined};
    //   this.selectDateRangeChanged(this.form[input.name], input);
    // }
    // if (input?.changed){
    //   input?.changed(event);
    // }
  }

  selectDateRangeSelected(event: any, input: CustomInput, item: IonRangeCalendarComponent) {
    console.log({ select: event, formDate: this.form[input.name] });
    if (this.form[input.name].from) {
      this.form[input.name].to = new Date(event.time);
    } else {
      this.form[input.name].from = new Date(event.time);
    }
    // this.tempDateRangeOptions[input.name] = undefined;
    // if (item._d.from && (item._d.to && new Date(item._d.to).getFullYear() != 1970)) {
    //   // this.inputs[this.inputs.findIndex(v => v.name === input.name)].dateRangeOptions = {...input.dateRangeOptions, ...{from: event.from, to: undefined}}
    //   setTimeout(() => {
    //     this.startSelectDateRange(event, input);
    //   }, 300);
    // }
  }

  checkClosestDisabledDay(input: CustomInput, date: Date) {
    if (input?.dateRangeOptions?.daysConfig) {
      const days = input?.dateRangeOptions?.daysConfig.map(v => v.date);
      let closest = days[0];
      let smallest = 0;
      for (let i = 1; i < days.length; i++) {
        const elm = days[i];
        const countDaysBetween = this.shared.getDatesBetween(date, elm).length;
        if (countDaysBetween < smallest) {
          smallest = countDaysBetween;
          closest = days[i];
        }
      }
      return closest;
    }
    return false;
  }

  printDateRange(input: CustomInput) {
    return this.form[input.name]?.from && this.form[input.name]?.to ? `<ion-text><span dir="ltr" class="date-txt">${this.form[input.name]?.from?.string}</span></ion-text> ${this.shared.lang == 'ar' ? 'إلى' : 'to'} <ion-text><span dir="ltr" class="date-txt">${this.form[input.name]?.to?.string}</span></ion-text>` : (this.shared.lang == 'ar' ? 'اختر التاريخ' : 'Choose Date');
  }

  submit() {
    this.isFirst = false;
    if (!this.checkValidation) return;
    this.pop.dismiss(this.form, 'success');
  }

  clear() {
    this.pop.dismiss(null, 'success');
  }

  close() {
    this.shared.backNavHistory();
    this.pop.dismiss(null, 'closed');
  }
}
