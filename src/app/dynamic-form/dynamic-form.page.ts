import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { CustomInput, SharedService } from '../services/shared.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.page.html',
  styleUrls: ['./dynamic-form.page.scss'],
})
export class DynamicFormPage implements OnInit, OnChanges {

  @Input() inputs!: CustomInput[];
  @Input() colSize: number = 6;
  @Input() width: number | null = null;
  @Input() minWidth: number | null = null;

  form: any;
  formToView: any;

  file: File | undefined;

  errors: any;

  loading!: HTMLIonLoadingElement;

  data: any;

  isFirst = true;

  prefix = Math.round(Math.random() * 10000);

  @Output() OnSubmit = new EventEmitter<any>();
  @Output() ComponentObject = new EventEmitter<any>();

  constructor(
    private shared: SharedService,
    private datePipe: DatePipe,
    private changeDetector: ChangeDetectorRef
  ) { }

  get checkValidation() {
    if (!this.inputs || this.inputs?.length == 0 || this.isFirst) return true;
    return this.inputs.filter(inp => inp?.required && (this.form[inp?.name] == null || this.form[inp?.name] == '')).length > 0 ? false : true;
  }
  
  ngOnInit() {
    this.prepare();
  }

  ngOnChanges() {
    this.prepare();
  }

  prepare() {
    const temp: any = {};
    const tempToView: any = {};
    if (this.inputs.length > 0)
    this.inputs.forEach(async (inp, index) => {
      if (inp.type == 'date') {
        temp[inp.name] = inp?.value ? this.datePipe.transform(inp?.value, 'YYYY-MM-dd') : this.datePipe.transform(new Date(), 'YYYY-MM-dd');
      } else if (inp.type == 'time') {
        const time = new Date();
        if (inp?.value) {
          const tt = inp.value?.split(':');
          time.setHours(tt[0]);
          time.setMinutes(tt[1]);
        }
        const tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
        const isoTime = (new Date(new Date(time).getTime() - tzoffset)).toISOString().slice(0, -1);
        temp[inp.name] = isoTime;
      } else if (inp.type == 'file') {
        if (typeof(inp?.value) !== "string") {
          temp[inp.name] = inp?.value;
        }
        this.inputs[index].value = await this.fileToUrl(inp?.value);
      } else if (inp?.value !== null) {
        temp[inp.name] = inp?.value;
      }
    });
    this.form = temp;
    this.formToView = tempToView;
    this.changeDetector.detectChanges();
    this.ComponentObject.emit(this);
  }

  submit() {
    this.isFirst = false;
    if (!this.checkValidation) return;
    const data = {...this.form};
    this.inputs.forEach(async (inp, index) => {
      if (inp.type == 'time') {
        if (this.form[inp.name]) {
          const dd = new Date(this.form[inp.name]);
          data[inp.name] = dd.getHours().toString().padStart(2, "0") +':'+ dd.getMinutes().toString().padStart(2, "0");
        }
      }
      if (inp.type == 'native-date') {
        if (this.form[inp.name]) {
          const dd = new Date(this.form[inp.name]);
          data[inp.name] = this.datePipe.transform(dd, 'yyyy-MM-dd HH:mm');
        }
      }
    });
    this.OnSubmit.emit(data);
  }

  fileChanged(event: any, inputName: any) {
    this.form[inputName] = event.event?.target?.files[0];
  }

  dateChanged(event: any, inputName: any) {
    console.log(`${inputName} = ${event.target.value}`, event);
    if (event.target.value === undefined) {
      this.form[inputName] = null;
    }
    if (this.inputs[inputName] && this.inputs[inputName].changed) {
      this.inputs[inputName]?.changed?.(event);
    }
    // this.form[inputName] = this.datePipe.transform(value, 'YYYY-MM-dd');
  }

  openNativeDatePicker(inputName: any) {
    const dateElement = document.getElementById(this.prefix+inputName) as HTMLInputElement;
    if (dateElement) {
      dateElement.showPicker();
      dateElement.click();
    }
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

}
