import { Pipe, PipeTransform } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';

@Pipe({
  name: 'mcurrency'
})
export class McurrencyPipe implements PipeTransform {

  constructor(
    private shared: SharedService
  ) {

  }
  transform(value: any, ...args: unknown[]): string {
    if (!value) { return value; };
    let v: any = value;
    if (value.toString().includes('.')) {
      v = parseFloat(value).toFixed(2);
    }
    let currency = args[0] || this.shared.currency;
    if (args[1] === 'html') {
      currency = `<span class="${args[2] || 'm-currency'}">${currency}</span>`;
    }
    return `${v} ${currency}`;
  }

}
