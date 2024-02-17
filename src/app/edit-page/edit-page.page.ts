import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { CustomInput, SharedService } from '../services/shared.service';
import { InputChangeEventDetail, IonPopover, Platform } from '@ionic/angular';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-edit-page',
  templateUrl: './edit-page.page.html',
  styleUrls: ['./edit-page.page.scss'],
})
export class EditPagePage implements OnInit {

  pop!: IonPopover;

  title = null;

  inputs: CustomInput[] = [];

  form: any;

  file: File | undefined;

  errors: any;

  isFirst = true;

  constructor(
    private shared: SharedService,
    private datePipe: DatePipe
  ) { }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    this.pop.dismiss(false, 'backButton', false);
  }

  get checkValidation() {
    return this.inputs.filter(inp => inp.required && !this.form[inp.name]).length > 0 ? false : true;
  }

  ngOnInit() {
    this.shared.clearNavHistory();
    const temp: any = {};
    this.inputs.forEach(async (inp, index) => {
      if (inp.type == 'date') {
        temp[inp.name] = inp?.value || this.datePipe.transform(new Date(), 'YYYY-MM-dd');
      } else if (inp.type == 'file') {
        temp[inp.name] = inp?.value;
        this.inputs[index].value = await this.fileToUrl(inp?.value);
      } else if (inp?.value) {
        temp[inp.name] = inp?.value;
      }
    });
    this.form = temp;
  }

  async fileToUrl(file: File | string) {
    return new Promise(resolve => {
      if (typeof(file) == "string") {
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

  fileChanged(event: any, inputName: any) {
    this.form[inputName] = event.event?.target?.files[0];
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
